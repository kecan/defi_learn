// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title JobsContract
 * @dev 管理任务创建、分配、完成和争议解决的核心合约
 */
contract JobsContract is ReentrancyGuard, Ownable {
    
    enum JobStatus { Open, Assigned, Completed, Disputed, Cancelled }
    
    struct Job {
        uint256 id;
        address creator;
        address assignedAgent;
        uint256 payment;
        uint256 deadline;
        JobStatus status;
        string requirements;
        string deliverable;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    struct Agent {
        address agentAddress;
        uint256 stakeAmount;
        uint256 reputation;
        bool isActive;
        uint256 completedJobs;
        uint256 totalEarnings;
    }
    
    // 状态变量
    mapping(uint256 => Job) public jobs;
    mapping(address => Agent) public agents;
    mapping(address => uint256[]) public userJobs; // 用户创建的任务列表
    mapping(address => uint256[]) public agentJobs; // Agent分配的任务列表
    
    uint256 public nextJobId = 1;
    uint256 public platformFeeRate = 250; // 2.5% (basis points)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public minimumStake = 100 * 10**6; // 100 USDT (6 decimals)
    
    IERC20 public immutable usdtToken;
    address public treasuryContract;
    
    // 事件
    event JobCreated(uint256 indexed jobId, address indexed creator, uint256 payment);
    event JobAssigned(uint256 indexed jobId, address indexed agent);
    event JobCompleted(uint256 indexed jobId, address indexed agent, string deliverable);
    event JobDisputed(uint256 indexed jobId, address indexed disputer);
    event AgentRegistered(address indexed agent, uint256 stakeAmount);
    event AgentDeactivated(address indexed agent);
    event ReputationUpdated(address indexed agent, uint256 newReputation);
    
    constructor(
        address _usdtToken,
        address _treasuryContract
    ) {
        usdtToken = IERC20(_usdtToken);
        treasuryContract = _treasuryContract;
    }
    
    /**
     * @dev 创建新任务
     */
    function createJob(
        string memory _requirements,
        uint256 _payment,
        uint256 _deadline
    ) external nonReentrant {
        require(_payment > 0, "Payment must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_requirements).length > 0, "Requirements cannot be empty");
        
        // 转移USDT到合约
        require(
            usdtToken.transferFrom(msg.sender, address(this), _payment),
            "USDT transfer failed"
        );
        
        uint256 jobId = nextJobId++;
        
        jobs[jobId] = Job({
            id: jobId,
            creator: msg.sender,
            assignedAgent: address(0),
            payment: _payment,
            deadline: _deadline,
            status: JobStatus.Open,
            requirements: _requirements,
            deliverable: "",
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        userJobs[msg.sender].push(jobId);
        
        emit JobCreated(jobId, msg.sender, _payment);
    }
    
    /**
     * @dev Agent注册并质押
     */
    function registerAgent(uint256 _stakeAmount) external nonReentrant {
        require(_stakeAmount >= minimumStake, "Stake amount too low");
        require(!agents[msg.sender].isActive, "Agent already registered");
        
        // 转移质押金额
        require(
            usdtToken.transferFrom(msg.sender, address(this), _stakeAmount),
            "Stake transfer failed"
        );
        
        agents[msg.sender] = Agent({
            agentAddress: msg.sender,
            stakeAmount: _stakeAmount,
            reputation: 1000, // 初始信誉分数 (满分1000)
            isActive: true,
            completedJobs: 0,
            totalEarnings: 0
        });
        
        emit AgentRegistered(msg.sender, _stakeAmount);
    }
    
    /**
     * @dev 分配任务给Agent
     */
    function assignJob(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        Agent storage agent = agents[msg.sender];
        
        require(job.status == JobStatus.Open, "Job not available");
        require(agent.isActive, "Agent not active");
        require(block.timestamp < job.deadline, "Job deadline passed");
        require(job.creator != msg.sender, "Cannot assign own job");
        
        job.status = JobStatus.Assigned;
        job.assignedAgent = msg.sender;
        
        agentJobs[msg.sender].push(_jobId);
        
        emit JobAssigned(_jobId, msg.sender);
    }
    
    /**
     * @dev 提交工作成果
     */
    function submitWork(uint256 _jobId, string memory _deliverable) external nonReentrant {
        Job storage job = jobs[_jobId];
        
        require(job.assignedAgent == msg.sender, "Not assigned to you");
        require(job.status == JobStatus.Assigned, "Job not in assigned status");
        require(bytes(_deliverable).length > 0, "Deliverable cannot be empty");
        
        job.deliverable = _deliverable;
        // 注意：这里不直接设为完成状态，需要创建者确认
        
        emit JobCompleted(_jobId, msg.sender, _deliverable);
    }
    
    /**
     * @dev 确认工作完成并支付
     */
    function approveWork(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        
        require(job.creator == msg.sender, "Only creator can approve");
        require(job.status == JobStatus.Assigned, "Invalid job status");
        require(job.assignedAgent != address(0), "No agent assigned");
        require(bytes(job.deliverable).length > 0, "No deliverable submitted");
        
        job.status = JobStatus.Completed;
        job.completedAt = block.timestamp;
        
        // 计算费用
        uint256 platformFee = (job.payment * platformFeeRate) / BASIS_POINTS;
        uint256 agentPayment = job.payment - platformFee;
        
        // 支付给Agent
        require(usdtToken.transfer(job.assignedAgent, agentPayment), "Agent payment failed");
        
        // 平台费用转到Treasury合约
        if (platformFee > 0) {
            require(usdtToken.transfer(treasuryContract, platformFee), "Platform fee transfer failed");
        }
        
        // 更新Agent统计
        Agent storage agent = agents[job.assignedAgent];
        agent.completedJobs++;
        agent.totalEarnings += agentPayment;
        
        // 更新信誉分数
        _updateReputation(job.assignedAgent, true);
    }
    
    /**
     * @dev 发起争议
     */
    function disputeWork(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        
        require(
            job.creator == msg.sender || job.assignedAgent == msg.sender,
            "Only creator or agent can dispute"
        );
        require(job.status == JobStatus.Assigned, "Invalid job status");
        
        job.status = JobStatus.Disputed;
        
        emit JobDisputed(_jobId, msg.sender);
    }
    
    /**
     * @dev 解决争议 (仅owner可调用)
     */
    function resolveDispute(
        uint256 _jobId,
        bool _favorCreator,
        uint256 _creatorRefund,
        uint256 _agentPayment
    ) external onlyOwner nonReentrant {
        Job storage job = jobs[_jobId];
        
        require(job.status == JobStatus.Disputed, "Job not disputed");
        require(_creatorRefund + _agentPayment <= job.payment, "Invalid distribution");
        
        job.status = JobStatus.Completed;
        job.completedAt = block.timestamp;
        
        // 分配资金
        if (_creatorRefund > 0) {
            require(usdtToken.transfer(job.creator, _creatorRefund), "Creator refund failed");
        }
        
        if (_agentPayment > 0) {
            require(usdtToken.transfer(job.assignedAgent, _agentPayment), "Agent payment failed");
        }
        
        // 剩余资金作为平台费用
        uint256 remaining = job.payment - _creatorRefund - _agentPayment;
        if (remaining > 0) {
            require(usdtToken.transfer(treasuryContract, remaining), "Remaining transfer failed");
        }
        
        // 更新信誉分数
        _updateReputation(job.assignedAgent, !_favorCreator);
    }
    
    /**
     * @dev 取消任务 (仅创建者可调用，且未分配)
     */
    function cancelJob(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        
        require(job.creator == msg.sender, "Only creator can cancel");
        require(job.status == JobStatus.Open, "Cannot cancel assigned job");
        
        job.status = JobStatus.Cancelled;
        
        // 退还资金
        require(usdtToken.transfer(job.creator, job.payment), "Refund failed");
    }
    
    /**
     * @dev Agent提取质押金 (停用账户)
     */
    function withdrawStake() external nonReentrant {
        Agent storage agent = agents[msg.sender];
        
        require(agent.isActive, "Agent not active");
        require(agent.stakeAmount > 0, "No stake to withdraw");
        
        // 检查是否有进行中的任务
        uint256[] memory jobs = agentJobs[msg.sender];
        for (uint256 i = 0; i < jobs.length; i++) {
            require(
                jobs[jobs[i]].status != JobStatus.Assigned,
                "Cannot withdraw with active jobs"
            );
        }
        
        uint256 stakeAmount = agent.stakeAmount;
        agent.stakeAmount = 0;
        agent.isActive = false;
        
        require(usdtToken.transfer(msg.sender, stakeAmount), "Stake withdrawal failed");
        
        emit AgentDeactivated(msg.sender);
    }
    
    /**
     * @dev 更新信誉分数
     */
    function _updateReputation(address _agent, bool _positive) internal {
        Agent storage agent = agents[_agent];
        
        if (_positive) {
            // 成功完成任务，信誉分数增加
            agent.reputation = agent.reputation + 10 > 1000 ? 1000 : agent.reputation + 10;
        } else {
            // 争议失败，信誉分数减少
            agent.reputation = agent.reputation > 50 ? agent.reputation - 50 : 0;
        }
        
        emit ReputationUpdated(_agent, agent.reputation);
    }
    
    // 查询函数
    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }
    
    function getAgent(address _agent) external view returns (Agent memory) {
        return agents[_agent];
    }
    
    function getUserJobs(address _user) external view returns (uint256[] memory) {
        return userJobs[_user];
    }
    
    function getAgentJobs(address _agent) external view returns (uint256[] memory) {
        return agentJobs[_agent];
    }
    
    // 管理员函数
    function setPlatformFeeRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 1000, "Fee rate too high"); // 最大10%
        platformFeeRate = _newRate;
    }
    
    function setMinimumStake(uint256 _newMinimum) external onlyOwner {
        minimumStake = _newMinimum;
    }
    
    function setTreasuryContract(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasuryContract = _newTreasury;
    }
}
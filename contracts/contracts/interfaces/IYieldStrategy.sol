// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IYieldStrategy {
    function deployFunds(uint256 amount) external;
    function harvestYield() external returns (uint256);
    function rebalancePortfolio() external;
    function withdrawFromProtocol(uint256 amount) external;
    function calculateTotalYield() external view returns (uint256);
}
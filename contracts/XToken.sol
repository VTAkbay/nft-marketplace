// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XToken is ERC20 {
    constructor() ERC20("XToken", "X") {
        _mint(msg.sender, 1000 * 10**18);
    }

    function debugFaucet() public {
        _mint(msg.sender, 10 * 10**18);
    }
}

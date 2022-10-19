// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XToken is ERC20 {
    constructor() ERC20("XToken", "X") {
        _mint(msg.sender, 1000 * 10**18);
    }
}

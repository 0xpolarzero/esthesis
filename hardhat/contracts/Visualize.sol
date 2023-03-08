// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/**
 * @title Visualize contract
 * @notice This contract is used to interact with the visualize app database
 * @author polarzero
 * @dev ...
 */

/// Errors
// ...

contract Visualize {
    /// Structs
    // ...

    /// Constants
    // ...

    /// Variables
    address private immutable i_owner;

    /// Mappings
    // ...

    /// Events
    // ...

    /**
     * @notice Constructor
     */
    constructor() {
        i_owner = msg.sender;
    }

    /**
     * @notice Get the owner
     */
    function getOwner() public view returns (address) {
        return i_owner;
    }
}

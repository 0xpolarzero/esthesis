// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/**
 * @title Eclipse contract
 * @notice This contract is used to interact with the eclipse app database
 * @author polarzero
 * @dev ...
 */

/// Errors
error ECLIPSE__NOT_OWNER();
error ECLIPSE__NOT_IN_ALLOWLIST(); // ? only on mainnet
// Favorites
error ECLIPSE__ALREADY_FAVORITE();
error ECLIPSE__NOT_FAVORITE();

contract Eclipse {
    /// Structs
    struct ShortenedURL {
        uint256 id;
        string properties;
        address sender;
    }

    /// Constants
    // ...

    /// Variables
    address private immutable i_owner;
    address private s_forwarder;
    // Shortened URLs
    ShortenedURL[] private s_shortenedURLs;

    /// Mappings
    // Favorites
    mapping(address => string[]) private s_favorites;

    /// Events
    event ECLIPSE__FAVORITE_ADDED(address _address, string _favorite);
    event ECLIPSE__FAVORITE_REMOVED(address _address, string _favorite);
    event ECLIPSE__URL_SHORTENED(
        uint256 _id,
        string _properties,
        address _sender
    );
    event ECLIPSE__FORWARDER_UPDATED(address _address);

    /// Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert ECLIPSE__NOT_OWNER();
        _;
    }

    /**
     * @notice Constructor
     * @param _forwarder The address of the forwarder
     */
    constructor(address _forwarder) {
        i_owner = msg.sender;
        s_forwarder = _forwarder;
    }

    /**
     * @notice Add a favorite to the database
     * @param _favorite The favorite to add
     * @param _user The address of the user, only if sponsoring gas fees
     */
    function addFavorite(string calldata _favorite, address _user) external {
        address sender = getSender(_user);

        // Is it already in the list?
        string[] memory favorites = s_favorites[sender];
        uint256 index = getFavoriteIndex(favorites, _favorite);
        if (index != favorites.length) revert ECLIPSE__ALREADY_FAVORITE();

        s_favorites[sender].push(_favorite);

        emit ECLIPSE__FAVORITE_ADDED(sender, _favorite);
    }

    /**
     * @notice Remove a favorite from the database
     * @param _user The address of the user, only if sponsoring gas fees
     * @param _favorite The favorite to remove
     */
    function removeFavorite(string calldata _favorite, address _user) external {
        address sender = getSender(_user);
        string[] memory favorites = s_favorites[sender];

        uint256 index = getFavoriteIndex(favorites, _favorite);
        if (index == favorites.length) revert ECLIPSE__NOT_FAVORITE();

        for (uint256 i = index; i < favorites.length - 1; i++) {
            s_favorites[sender][i] = favorites[i + 1];
        }
        s_favorites[sender].pop();

        emit ECLIPSE__FAVORITE_REMOVED(sender, _favorite);
    }

    /**
     * @notice Add a shortened URL to the database
     * @param _properties The customized properties
     * @param _sender The address of the sender, only if sponsoring gas fees
     * @return id The ID of the shortened URL
     */
    function shortenURL(
        string calldata _properties,
        address _sender
    ) external returns (uint256 id) {
        address sender = getSender(_sender);

        id = s_shortenedURLs.length;
        s_shortenedURLs.push(ShortenedURL(id, _properties, sender));

        emit ECLIPSE__URL_SHORTENED(id, _properties, sender);
    }

    /**
     * @notice Update the trusted forwarder
     * @param _address The address of the new forwarder
     */
    function updateForwarder(address _address) external onlyOwner {
        s_forwarder = _address;
        emit ECLIPSE__FORWARDER_UPDATED(_address);
    }

    /**
     * @notice Get the sender of a transaction
     * @param _address The address of the user
     * @return address The address of the sender
     * @dev If sent via the app, it will be the address, from the param
     * if not, it will be the msg.sender
     */
    function getSender(address _address) public view returns (address) {
        return msg.sender == s_forwarder ? _address : msg.sender;
    }

    /**
     * @notice Get the complete URL for an ID
     * @param _id The ID of the shortened URL
     * @return ShortenedURL The shortened URL (struct)
     */
    function getShortenedURL(
        uint256 _id
    ) public view returns (ShortenedURL memory) {
        return s_shortenedURLs[_id];
    }

    /**
     * @notice Get all the shortened URLs
     * @return ShortenedURL[] The shortened URLs array
     */
    function getShortenedURLs() public view returns (ShortenedURL[] memory) {
        return s_shortenedURLs;
    }

    /**
     * @notice Get the favorites for an address
     * @param _address The address of the user
     * @return string[] The favorites array
     */
    function getFavorites(
        address _address
    ) public view returns (string[] memory) {
        return s_favorites[_address];
    }

    /**
     * @notice Get the index of a favorite for an address
     * @param _favorites The favorites of the user
     * @param _favorite The favorite to find
     * @return uint256 The index of the favorite
     */
    function getFavoriteIndex(
        string[] memory _favorites,
        string calldata _favorite
    ) public pure returns (uint256) {
        for (uint256 i = 0; i < _favorites.length; i++) {
            if (
                keccak256(abi.encodePacked(_favorites[i])) ==
                keccak256(abi.encodePacked(_favorite))
            ) {
                return i;
            }
        }
        return _favorites.length;
    }

    /**
     * @notice Get the owner
     * @return address The owner address
     */
    function getOwner() public view returns (address) {
        return i_owner;
    }

    /**
     * @notice Get the forwarder
     * @return address The forwarder address
     */
    function getForwarder() public view returns (address) {
        return s_forwarder;
    }
}

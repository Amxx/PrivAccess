// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Registration is
    Ownable,
    ERC721("Registration", "Reg"),
    ERC721Enumerable
{
    function mint(address recipient) external onlyOwner() {
        _mint(recipient, totalSupply());
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(address from,address to,uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable) {
        return super._beforeTokenTransfer(from, to, tokenId);
    }
}
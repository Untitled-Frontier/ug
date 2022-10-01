//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// Core utils used extensively to format CSS and numbers.

// modified from original to take away functions that I'm not using
// also includes the random number parser 
contract Utils {
    // converts an unsigned integer to a string
    function uint2str(uint256 _i)
        public
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return '0';
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // helper function for generation
    // from: https://github.com/GNSPS/solidity-bytes-utils/blob/master/contracts/BytesLib.sol 
    function toUint8(bytes memory _bytes, uint256 _start) internal pure returns (uint8) {
        require(_start + 1 >= _start, "toUint8_overflow");
        require(_bytes.length >= _start + 1 , "toUint8_outOfBounds");
        uint8 tempUint; 

        assembly {
            tempUint := mload(add(add(_bytes, 0x1), _start))
        }
        return tempUint;
    }

    function generateDecimalString(uint nr, uint decimals) public pure returns (string memory) {
        if(decimals == 1) { return string(abi.encodePacked('0.', uint2str(nr))); }
        if(decimals == 2) { return string(abi.encodePacked('0.0', uint2str(nr))); }
        if(decimals == 3) { return string(abi.encodePacked('0.00', uint2str(nr))); }
        if(decimals == 4) { return string(abi.encodePacked('0.000', uint2str(nr))); }
    }

    // entropy carving
    // extrapolated into utils file in order to re-use between drawing + trait generation
    // 19 random variables
    function getAmount(bytes memory hash) public pure returns (uint256) { return 2+uint256(toUint8(hash, 0))/16;  }  // 2 - 18
    function getRange(bytes memory hash) public pure returns (uint256) { return 220 + uint256(toUint8(hash, 1))/4;  } // 180 - 240
    function getColour(bytes memory hash) public pure returns (uint256) { return uint256(toUint8(hash, 2))*360/256;  } // 0 - 360
    function getColourShift(bytes memory hash) public pure returns (uint256) { return uint256(toUint8(hash, 3));  } // 0 - 255
    function getSandSeed(bytes memory hash) public pure returns (uint256) { return uint256(toUint8(hash, 4));  } 
    function getSandScale(bytes memory hash) public pure returns (uint256) { return 1 + uint256(toUint8(hash, 5))/8;  } 
    function getSandOctaves(bytes memory hash) public pure returns (uint256) {return 1 + uint256(toUint8(hash, 6))/64;  } 
    function getFineSandSeed(bytes memory hash) public pure returns (uint256) {return uint256(toUint8(hash, 7)); } 
    function getFineSandOctaves(bytes memory hash) public pure returns (uint256) {return 1 + uint256(toUint8(hash, 8))/64; } 
    function getColourOffsetShift(bytes memory hash, uint256 offsetIndex) public pure returns (uint256) {
        
        if(offsetIndex == 0 ) { return uint256(toUint8(hash, 9))/128; } // red
        if(offsetIndex == 1 ) { return uint256(toUint8(hash, 10))/128; } // green
        if(offsetIndex == 2 ) { return uint256(toUint8(hash, 11))/128; } // blue
    } 
    function getColourOffsetChange(bytes memory hash, uint256 offsetIndex) public pure returns (uint256) {

        if(offsetIndex == 0 ) { return uint256(toUint8(hash, 12))*100/256; } // red
        if(offsetIndex == 1 ) { return uint256(toUint8(hash, 13))*100/256; } // green
        if(offsetIndex == 2 ) { return uint256(toUint8(hash, 14))*100/256; } // blue
    } 
    function getLeftY(bytes memory hash) public pure returns (uint256) {return 100+uint256(toUint8(hash, 15))/16; } 
    function getRightY(bytes memory hash) public pure returns (uint256) {return 100+uint256(toUint8(hash, 16))/16; } 
    function getDiffLeft(bytes memory hash) public pure returns (uint256) {return 10+uint256(toUint8(hash, 17))/16; } 
    function getDiffRight(bytes memory hash) public pure returns (uint256) {return 10+uint256(toUint8(hash, 18))/16; } 


}

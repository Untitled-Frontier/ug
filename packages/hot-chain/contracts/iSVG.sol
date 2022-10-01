//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// Core SVG utilitiy library which helps us construct
// onchain SVG's with a simple, web-like API.

// modified from original to take away functions that I'm not using

interface iSVG {
    /* MAIN ELEMENTS */

    function rect(string memory _props, string memory _children)
        external
        pure
        returns (string memory);

    function rect(string memory _props)
        external
        pure
        returns (string memory);

    function filter(string memory _props, string memory _children)
        external
        pure
        returns (string memory);

    
    /* COMMON */
    // A generic element, can be used to construct any SVG (or HTML) element
    function el(
        string memory _tag,
        string memory _props,
        string memory _children
    ) external pure returns (string memory);

    // A generic element, can be used to construct any SVG (or HTML) element without children
    function el(
        string memory _tag,
        string memory _props
    ) external pure returns (string memory);

    // an SVG attribute
    function prop(string memory _key, string memory _val)
        external 
        pure
        returns (string memory);
    
}

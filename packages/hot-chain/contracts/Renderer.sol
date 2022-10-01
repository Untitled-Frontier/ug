//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

// deploy svg + utils in here.
// pass address to words + definitions + trait generator

import './SVG.sol';
import './Utils.sol';
import './Words.sol';
import './Definitions.sol';

contract Renderer {
    SVG public svg;
    Utils public utils;
    Definitions public defs;
    Words public words;

    constructor() {
        svg = new SVG();
        utils = new Utils();
        defs =  new Definitions(address(svg), address(utils));
        words = new Words(address(svg), address(utils));
    }

    function render(uint256 _tokenId) public view returns (string memory) {
        bytes memory hash = abi.encodePacked(bytes32(_tokenId));

        return
            string.concat(
                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" style="background:#fff; border: 1px solid black">',
                //defs.masks(),
                //defs.clipPaths(),
                //defs.filters(hash),
                craftSand(hash),
                cutOut(hash),
                capsuleOutline(),
                '</svg>'
            );
    }

    /* RE-USABLE SHAPES */
    function sandRect(string memory y, string memory h, string memory fill, string memory opacity) public view returns (string memory) {
        return svg.rect(
            string.concat(
                svg.prop('width', '300'),
                svg.prop('y',y),
                svg.prop('height',h),
                svg.prop('fill',fill),
                svg.prop('stroke','black'),
                svg.prop('filter','url(#sandFilter)'),
                svg.prop('opacity', opacity)
            )
        );        
    }

    function whiteRect() public view returns (string memory) {
        return svg.rect(
            string.concat(
                svg.prop('width','100%'),
                svg.prop('height', '100%'),
                svg.prop('fill', 'white')
            )
        );
    }

    /* CONSTRUCTIONS */
    function craftSand(bytes memory hash) public view returns (string memory) {
        string memory sandRects = '<rect width="100%" height="100%" filter="url(#fineSandFilter)"/> '; // background/fine sand

        uint amount = utils.getAmount(hash); // 2 - 18
        uint range = utils.getRange(hash);
        uint height = 0;
        uint y = 0;
        uint shift = 3;
        uint colour =  utils.getColour(hash);// 0 - 360
        uint cShift = utils.getColourShift(hash); // 0 - 255
        string memory opacity = "1";
        for (uint i = 1; i <= amount; i+=1) {
            y+=height;
            if(i % 2 == 0) {
                height = range*shift/2 >> shift;
                shift += 1;
            }
            opacity = "1";
            if ((y+colour) % 5 == 0) { opacity = "0"; }
            sandRects = string.concat(
                sandRects,
                sandRect(utils.uint2str(y), utils.uint2str(height), string.concat('hsl(',utils.uint2str(colour),',70%,50%)'), opacity)
            );
            colour+=cShift;
        }

        return sandRects;
    }

    function capsuleOutline() public view returns (string memory) {
        return string.concat(
            // top half of capsule
            svg.rect(string.concat(svg.prop('x', '111'), svg.prop('y', '50'), svg.prop('width', '78'), svg.prop('height', '150'), svg.prop('ry', '40'), svg.prop('rx', '40'), svg.prop('mask', 'url(#cutoutMask)'), svg.prop('clip-path', 'url(#clipBottom)'))),
            // bottom half of capsule
            svg.rect(string.concat(svg.prop('x', '113'), svg.prop('y', '50'), svg.prop('width', '74'), svg.prop('height', '205'), svg.prop('ry', '35'), svg.prop('rx', '50'), svg.prop('mask', 'url(#cutoutMask)'))),
            // crossbar of capsule 
            svg.rect(string.concat(svg.prop('x', '111'), svg.prop('y', '150'), svg.prop('width', '78'), svg.prop('height', '4'))),
            // top reflection
            svg.rect(string.concat(svg.prop('x', '115'), svg.prop('y', '45'), svg.prop('width', '70'), svg.prop('height', '40'), svg.prop('ry', '100'), svg.prop('rx', '10'), svg.prop('fill', 'white'), svg.prop('opacity', '0.4'), svg.prop('mask', 'url(#topReflectionMask)'))),
            // long reflection
            svg.rect(string.concat(svg.prop('x', '122'), svg.prop('y', '55'), svg.prop('width', '56'), svg.prop('height', '184'), svg.prop('ry', '30'), svg.prop('rx', '30'), svg.prop('fill', 'white'), svg.prop('opacity', '0.4'))),
            // drop shadow
            svg.rect(string.concat(svg.prop('x', '115'), svg.prop('y', '180'), svg.prop('width', '70'), svg.prop('height', '70'), svg.prop('ry', '30'), svg.prop('rx', '30'), svg.prop('filter', 'url(#dropShadowFilter)'), svg.prop('clip-path', 'url(#clipShadow)')))
        );
    }

    function cutOut(bytes memory hash) public view returns (string memory) {
        return svg.el('g', svg.prop('mask', 'url(#cutoutMask)'),
            string.concat(
                whiteRect(),
                words.whatIveDone(hash, false)
            )
        );
    }

    /* HELPERS */

    // hot-chain-svg calls this to render an example image
    // gasleft() is a hack to get a random nr. The call varies the gas being sent.
    function example() external view returns (string memory) {
        uint256 rnr = uint(keccak256(abi.encodePacked(uint256(gasleft()))));
        //uint256 timestamp = uint(keccak256(abi.encodePacked(uint256(1000011113511))));
        return render(rnr);
    }
}

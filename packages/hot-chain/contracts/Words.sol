//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import './SVG.sol';
import './Utils.sol';

contract Words {

    SVG public svg;
    Utils public utils;

    string[] public actions = [
        'SPOKE WATER',
        'SCULPTED SOUND', 
        'BEGAN BEGINNINGS', 
        'BECAME ECOLOGY',
        'TASTED LIGHT',
        'NOURISHED DEATH',
        'DANCED COSMIC',
        'EMBODIED MOUNTAIN',
        'EXPLORED DIVINITY',
        'DEEPENED STILLNESS',
        'REFLECTED STARS',
        'UNITED FRIENDS',
        'BEFRIENDED DARKNESS',
        'FELT UNIVERSAL',
        'INITIATED EARTHSTORY',
        'EMBRACED ALL',
        'ROAMED UNIVERSE',
        'FLOATED CLOUDS',
        'MOVED EVERYBODY',
        'FELT COSMIC',
        'SHOOK TRAUMA',
        'HEALED PAIN',
        'REGENERATED',
        'LOVED', 
        'DANCED',
        'LAUGHED', 
        'DREAMED',
        'AWAKENED', 
        'WANDERED', 
        'EXPLORED', 
        'THOUGHT',
        'CIRCULATED', 
        'FLIRTED', 
        'CHERISHED',
        'TOYED', 
        'PLAYED', 
        'SWAM', 
        'CREATED', 
        'EMBOLDENED',
        'GALVANISED',
        'HEARTENED',
        'KINDLED',
        'AWAKENED',
        'INCITED', 
        'GREW ROOTS',
        'UNDERSTOOD RAIN',
        'AWAKENED ELECTRICITY',
        'THOUGHT CRYSTAL',
        'SURPRISED BEINGS',
        'PLAYED INFINITELY',
        'SNUGGLED DANGER',
        'PINCHED MAGMA',
        'JUGGLED MOMENTS'
    ];

    string[][] public passageList = [
        ['LIVE TOO', 'MANY LIVES', 'IN THE', 'SIMULATION AND', 'YOU BECOME', 'A CANYON', 'ERODED BY', 'A RIVER,', 'UNABLE TO', 'CHANGE COURSE.']
    ];

    /*string[] public passages = [
        'Live too many lives in the simulation and you become a canyon eroded by a river, unable to change course.',
        'Each experience, emotion, and reaction created a pattern that informed how she navigated her existence. These patterns accumulated into behaviours and thoughts that transferred across from a physical body into simulation.',
        'She started to dance again, stretching out her body and letting the thoughts roll off her fingers, marinating in the epiphany.'
    ];*/

    /*function passage(bytes memory hash) public view returns (string memory) {
        string memory passage;
        
        //             '<use xlink:href="#path1" x="0" y="35" stroke="blue" stroke-width="1"/>',


        // path skipping capsule
        // '<path id="path1" d="M0,95 H110 M180,95 H300 M0,130 H110 M180,130 H300 M0,165 H120 M180,165 H300 M0,200 H120 M180,200 H300 M0,235 H120 M180,235 H300"/>',

        // path going through capsule
        // '<path id="path1" d="M0,95 H300 M0,130 H300 M0,165 H300 M0,200 H300 M0,235 H300"/>',

        // top path
        // '<path id="path1" d="M0,10 H300 M0,40 H300 M0,70 H300 M0,270 H300 M0,290 H300"/>',


        passage = string.concat(
            // '<path id="path1" d="M0,20 H110 M180,20 H300 M0,60 H110 M180,60 H300 M0,120 H120 M180,120 H300 M0,180 H120 M180,180 H300 M0,240 H120 M180,240 H300"/>',
            '<path id="path1" d="M0,36 H300 M0,96 H300 M0,156 H300 M0,216 H300 M0,276 H300"/>',
            '<text fill="black" font-size="24" font-family="Helvetica">',
            '<textPath xlink:href="#path1">LIVE TOO MANY LIVES IN THE SIMULATION AND YOU BECOME A CANYON ERODED BY A RIVER, UNABLE TO CHANGE COURSE.......</textPath>',
            '</text>'
        );

        return passage;
    }*/

    struct WordDetails {
        string lineX1;
        string lineX2;
        string lineY;
        string textX;
        string textY;
        string textAnchor;
    }

    constructor(address svgAddress, address utilsAddress) {
        svg = SVG(svgAddress);
        utils = Utils(utilsAddress);
    }

    function whatIveDone(bytes memory hash, bool passage) public view returns (string memory) {
        string memory wordList;

        uint256 leftY;
        uint256 rightY;
        uint256 diffLeft;
        uint256 diffRight;
        string[] memory textSource;
        
        if(passage == true) {
            leftY = 100;
            rightY = 100;
            diffLeft = 25;
            diffRight = 25;
            textSource = passageList[0];
        } else {
            leftY = utils.getLeftY(hash); // 100 - 116
            rightY = utils.getRightY(hash); // 100 - 116
            diffLeft = utils.getDiffLeft(hash); // 10 - 33
            diffRight = utils.getDiffRight(hash); // 9 - 25
            textSource = actions;
        }

        WordDetails memory details;

        for(uint i = 0; i < 10; i+=1) {
            // 10 slots. 5 a side.
            // words are drawn left-right, then down.
            uint y;
            if(i % 2 == 0) {
                details.lineX1 = '10'; //x1
                details.lineY = utils.uint2str(leftY-3); //y1, y2
                details.lineX2 = '150'; //x2
                details.textY = utils.uint2str(leftY);
                details.textX = '10';
                details.textAnchor = 'start';
                y = leftY;

                leftY += diffLeft;
            } else {
                details.lineX1 = '150'; //x1
                details.lineY = utils.uint2str(rightY-3); //y1, y2
                details.lineX2 = '280'; //x2
                details.textY = utils.uint2str(rightY);
                details.textX = '290';
                details.textAnchor = 'end';
                y = rightY;

                rightY += diffRight;
            }

            if(y % 4 == 0 || passage == true) {
                wordList = string.concat(wordList, 
                     svg.el('line', string.concat(svg.prop('x1', details.lineX1), svg.prop('y1', details.lineY), svg.prop('x2', details.lineX2), svg.prop('y2', details.lineY), svg.prop('stroke', 'black'))),
                     singularAction(details.textAnchor, details.textX, details.textY, textSource[i])
                );
            }
        }

        return wordList;
    }

    function singularAction(string memory anchor, string memory x, string memory y, string memory action) public view returns (string memory) {
        return svg.el('text', string.concat(
            svg.prop('text-anchor', anchor),
            svg.prop('x', x),
            svg.prop('y', y),
            svg.prop('font-family', 'Helvetica'),
            svg.prop('fill', 'black'),
            svg.prop('font-weight', 'bold'),
            svg.prop('font-size', '7'),
            svg.prop('filter', 'url(#solidTextBGFilter)')),
            action
        );
    }
}

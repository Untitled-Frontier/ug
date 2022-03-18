import React, { useState, useEffect, Fragment } from "react";
import { Button, Form, Input } from "antd";


import NFTImg from "./splash.png"; 
import CellsComponent from "./CellsComponent";
import { keccak256 } from "ethers/lib/utils";

function IntroPage(props) {

    const [mintSection, setMintSection] = useState('');
    const [displaySection, setDisplaySection] = useState('');

    const startDateString = "4 April 2022 14:00 GMT";
    const endDateString = "25 April 2022 14:00 GMT";
    const snapshotDate = "14 March 2022 14:00 GMT";
    const startDateUnix = 0;
    const endDateUnix = 0;

    const wrongNetworkHTML = <Fragment>You are on the wrong network. Please switch to mainnet on your web3 wallet and refresh the page.</Fragment>;

    const offlineHTML = <Fragment>
    [In order to mint an NFT, you need to  have a web3/Ethereum-enabled browser and connect it (see top right of the page). Please download
      the <a href="https://metamask.io">MetaMask Chrome extension</a> or open in an Ethereum-compatible browser.]
    </Fragment>;

    function mintNFT() {
      props.mintNFT();
    }

    function claim() {
      console.log("claim!");
      props.claim(props.tree.getHexProof(keccak256(props.address)));
    }

    const [owner, setOwner] = useState(null);

    useEffect(() => {

        if(typeof props.address !== 'undefined' && props.ACSigner !== null && props.tree !== null) {
          console.log(props.address.toLowerCase());
          let disabled = true; 
          var unix = Math.round(+new Date()/1000);
          if(unix >= startDateUnix) { disabled = false; }

          let claimHTML = <Fragment>
            You are not eligible for a free claim. <br />
            <br />
            <Button size={"small"} disabled={true} loading={props.minting} onClick={claim}>
                Claim Little Martian
              </Button>
          </Fragment>

          // verify is address is in the tree
          const hashedLeaf = keccak256(props.address);
          const proof = props.tree.getHexProof(hashedLeaf);
          const root = props.tree.getHexRoot();
          const inTree = props.tree.verify(proof, hashedLeaf, root);

          if(inTree) {
            claimHTML = <Fragment>
              <Button size={"small"} disabled={disabled} loading={props.minting} onClick={claim}>
                Claim Little Martian
              </Button>
              </Fragment>
          }

          const newMintHTML = <Fragment>
            {props.dfPrice} ETH (~$100). Available, with no supply limit, until {endDateString}. <br />
            <Button size={"small"} disabled={disabled} loading={props.minting} onClick={mintNFT}>
                Mint Little Martian
            </Button>
            <br />
            <br />
            {claimHTML}
            <br />
            <br />
            By minting, you agree to the <a href="https://github.com/Untitled-Frontier/tlatc/blob/master/TOS_PP.pdf">Terms of Service</a>.
            <br />
            <br />
          </Fragment>

          // verifyClaim();
          setMintSection(newMintHTML);
        }
    }, [props.address, props.NFTSigner, props.minting, props.tree]);

    useEffect(() => {
        if(props.injectedChainId !== props.hardcodedChainId && props.injectedChainId !== null) {
          setMintSection(wrongNetworkHTML);
        } else if(props.injectedChainId == null) {
          setMintSection(offlineHTML);
        }
      }, [props.hardcodedChainId, props.NFTSigner]);

    useEffect(() => {
      if(props.tokenId !== 0) {
        // new NFT was minted, thus display it.
        setDisplaySection(
          <Fragment>
            <h2>Your new Little Martian!</h2>
            <CellsComponent tokenId={props.tokenId} NFTSigner={props.NFTSigner} /> <br />
            To interact with the NFT: to view it, to transfer it, and to see other NFTs, head to <a href="https://opensea.io/collection/paintings-of-forgotten-souls" target="_blank">OpenSea</a>. 
            It's a platform to view and interact with NFTs, including Little Martians. It will be in your profile. 
            If you choose to mint another, new Little Martian, it will update to display your new one. All Little Martians, however, are recorded
            on the Ethereum blockchain, and viewable in OpenSea.
          </Fragment>
        );
      }
    }, [props.tokenId, props.NFTSigner]);

    return (

        <div className="App" style={{textAlign:"justify"}}> 
        <img src={NFTImg} alt="Little Martians" style={{display:"block", marginLeft:"auto", marginRight: "auto", maxWidth:"100%"}}/> <br />
        In the story, "Little Martians and The Human Memorial Monument" by Vanessa Rosa, the Martian, Nyx, gives simulated minds a new home and stores them in cosmic ceramic bodies.
        The patterns on the outside stores the information that defines who they are. NFT memorabilia for this story consists of ((NUMBER)) generative, deluxe, limited editions on Foundation and on-chain Little Martians.
        <br />
        <br />
        "Little Martians" come in the form of fully on-chain generative art NFTs! 
        From {startDateString} until {endDateString}, fans can mint on-chain Little Martians. 
        If you held any Anchor Certificate from <a href="https://www.untitledfrontier.studio/blog/the-logged-universe-1-the-line-to-anchor-city">"The Line To Anchor City"</a> PLUS any Painting of Forgotten Souls from <a href="https://www.untitledfrontier.studio/blog/the-logged-universe-2-memories-of-atlas">"Memories of Atlas"</a> by the snapshot of {snapshotDate}, you can claim an on-chain Martian for free!
        <br />
        <br />
        <h2>[] Little Martians</h2>
        Any amount of on-chain Little Martians can be generated during the campaign period of 4 weeks. 
        After this period no new ones can be minted or claimed.
        <br />
        <br />
        Each Little Martian consists of 10 different shells and a random generative art pattern that comprises their DNA. Each one is unique, changing variations of patterns, colours, blurs, and intricacies.
        <br />
        <br />
        The components that make up the Little Martians are licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Thus, you are free to use the NFTs as you wish. <a href="https://github.com/Untitled-Frontier/lmhmm">The code is available on Github.</a>
        <br />
        <br />
        A deluxe, limited collection of ((NUMBER)) generative scenes from "Little Martians and The Human Memorial Monument" is available on Foundation.
        <br />
        <br />
        {/* MINT SECTION */}
        <div className="section">
        <h2>[] Mint/Claim</h2>
        {mintSection}
        </div>
        <br />
        {displaySection}
        <br />
        <br />
        </div>
    );
}

export default IntroPage

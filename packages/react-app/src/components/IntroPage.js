import React, { useState, useEffect, Fragment } from "react";
import { Button, Form, Input, InputNumber } from "antd";

import NFTImg from "./splash.png"; 
import CellsComponent from "./CellsComponent";
import { keccak256 } from "ethers/lib/utils";

function IntroPage(props) {

    const [displayFromSeedForm] = Form.useForm();
    const [mintSection, setMintSection] = useState('');
    const [displaySection, setDisplaySection] = useState('');
    const [seed, setSeed] = useState('0');
    const [owner, setOwner] = useState(null);
    const [initialDraw, setInitialDraw] = useState(false);
    const [formExists, setFormExists] = useState(false);

    const startDateString = "03 October 2022 14:00 GMT";
    const endDateString = "31 October 2022 14:00 GMT";
    const snapshotDate = "26 September 2022 14:00 GMT";
    const startDateUnix = 1664805600; // 1664805600
    const endDateUnix = 1667224800;

    const wrongNetworkHTML = <Fragment>You are on the wrong network. Please switch to mainnet on your web3 wallet and refresh the page.</Fragment>;

    const offlineHTML = <Fragment>
    [In order to mint an NFT, you need to  have a web3/Ethereum-enabled browser and connect it (see top right of the page). Please download
      the <a href="https://metamask.io">MetaMask Chrome extension</a> or open in an Ethereum-compatible browser.] <br />
      <br />
    </Fragment>;

    // Not being used in the interface but keeping it in here for future
    /*function withdrawETH() {
      props.withdrawETH();
    }*/

    function displayFromSeed(values) {
      console.log(values);
      props.displayFromSeed(values.seed);
    }

    function seedChanged(changedValues) {
      console.log(changedValues);
      setSeed(changedValues.seed);
    }

    function generateRandomSeed() {
      const randomNr = Math.floor(Math.random()*1000000);
      displayFromSeedForm.setFieldValue("seed", randomNr);
      seedChanged({"seed": randomNr});
      console.log('rnr');
      console.log(randomNr);
      displayFromSeedForm.submit();
    }

    function mintCustomNFT() {
      console.log(seed);
      props.mintCustomNFT(seed);
    }

    function mintRandomNFT() {
      console.log('minting random NFT');
      props.mintRandomNFT();
    }

    function claim() {
      console.log("claim!");
      props.claim(props.tree.getHexProof(keccak256(props.address)));
    }

    useEffect(() => {
        if(typeof props.address !== 'undefined' && props.NFTSigner !== null && props.tree !== null && props.injectedChainId === props.hardcodedChainId) {

          console.log(props.address.toLowerCase());
          let disabled = true; 
          var unix = Math.round(+new Date()/1000);
          if(unix >= startDateUnix) { disabled = false; } 
          if(unix >= endDateUnix) { disabled = true; } 

          let claimHTML = <Fragment>
          </Fragment>

          // verify is address is in the tree
          const hashedLeaf = keccak256(props.address);
          const proof = props.tree.getHexProof(hashedLeaf);
          const root = props.tree.getHexRoot();
          const inTree = props.tree.verify(proof, hashedLeaf, root);

          if(inTree) {
            claimHTML = <Fragment>
              <br />
              <Button type="primary" size={"medium"} disabled={disabled} loading={props.minting} onClick={claim}>
                Claim a Random Capsule (Free)
              </Button>
              <br />
              <br />
              You are eligible to claim a free random capsule! Thank you for the support! <br />
              </Fragment>

              if(props.alreadyClaimed == true) {
                claimHTML = <Fragment>
                  <br />
              <Button type="primary" size={"medium"} disabled={false} loading={props.minting} onClick={claim}>
                Claim a Random Capsule (Free)
              </Button>
              <br />
              <br />
              You are eligible to claim a free random capsule! Thank you for the support! (You've already claimed a free capsule). <br />
              </Fragment>
              }
          }

          let mintButton;
          let disabledSeedMint = true;
          if(props.SVG !== null) {
            disabledSeedMint = disabled;
          }
          mintButton = <Button type="primary" size={"medium"} disabled={disabledSeedMint} loading={props.minting} onClick={mintCustomNFT}>
            Mint Custom Capsule with Seed (0.074 ETH): {displayFromSeedForm.getFieldValue("seed")}
          </Button>

          const newMintHTML = <Fragment>
            {displaySection}

            <Form layout="inline" size="small"  form={displayFromSeedForm} name="control-hooks" onFinish={displayFromSeed} onValuesChange={seedChanged}>
            <Form.Item name="seed" rules={[
              { required: true,  message: "Number Required!"}
              ]}>
              <InputNumber /> 
            </Form.Item>
            <br /><br /> 
            <Form.Item>
              <Button htmlType="submit">
              Preview a Capsule from a Custom Seed
              </Button>
            </Form.Item>
            </Form>
            <Button size={"small"} onClick={generateRandomSeed}>
              Preview a Capsule with a New Random Seed 
            </Button>
            <br />
            <br />
            
            {mintButton}
            <br />
            <br />
            <Button type="primary" size="medium" disabled={disabled} loading={props.minting} onClick={mintRandomNFT}>
              Mint a Random Capsule (0.022 ETH)
            </Button>
            <br />
            {claimHTML}
            <br />
            By minting, you agree to the <a href="https://github.com/Untitled-Frontier/tlatc/blob/master/TOS_PP.pdf">Terms of Service</a>.
            <br />
            <br />

            
          </Fragment>

          setMintSection(newMintHTML);
          setFormExists(true); // this is necessary to ensure that if it's on the wrong network that it doesn't try to generate a seed.
        }
    }, [props.address, props.NFTSigner, props.minting, props.tree, props.vm, props.localNFTAddress, props.alreadyClaimed, displaySection, seed]);

    // once it's possible to mint, load up a capsule preview
    useEffect(() => {
      if(formExists == true && initialDraw == false && typeof props.address !== 'undefined' && props.NFTSigner !== null && props.tree !== null) {
        generateRandomSeed();
        setInitialDraw(true);
      }
    }, [mintSection, formExists]);

    useEffect(() => {
      if(props.injectedChainId !== props.hardcodedChainId && props.injectedChainId !== null) {
        console.log('wrong network');
        setMintSection(wrongNetworkHTML);
      } else if(props.injectedChainId == null) {
        setMintSection(offlineHTML);
      }
    }, [props.hardcodedChainId, props.NFTSigner]);

    useEffect(() => {
      console.log(props.SVG);
      if(props.SVG !== null) {
        setDisplaySection(
          <Fragment>
            <h2>A Preview of a Capsule:</h2>
            <CellsComponent svg={props.SVG} /> <br />
          </Fragment>
        );
      }
    }, [props.SVG]);

    useEffect(() => {
      if(props.mintedSVG !== null) {
        setDisplaySection(
          <Fragment>
            <h2>Your new capsule has been minted!</h2>
            <CellsComponent svg={props.mintedSVG} /> <br />
            To interact with the NFT: to view it, to transfer it, and to see other NFTs, head to <a href="https://opensea.io/collection/capsules-of-all-our-lives" target="_blank">OpenSea</a>. 
            It's a platform to view and interact with NFTs, including the Capsules. It will be in your profile. 
            If you choose to mint another, new Capsule, it will update to display your new one. All Capsules, however, are recorded
            on the Ethereum blockchain, and viewable in OpenSea.<br />
            <br />
          </Fragment>
        );
      }
    }, [props.mintedSVG]);

    return (
        <div className="App" style={{textAlign:"justify"}}> 
        <br />
        From <b>{startDateString} until {endDateString}</b>, fans can mint or claim on-chain, generative art capsules from the Logged Universe story, "Upstream Glitches" (a limited time only)! Details below.
        <br />
        <br />
        <b>THE CAMPAIGN HAS ENDED. THANK YOU FOR THE SUPPORT!</b>
        <br />
        <br />
        {/* MINT SECTION */}
        <div className="section">
        {mintSection}
        </div>
        <h2>[] DETAILS </h2>
        <img src={NFTImg} alt="Capsules of All Our Lives" style={{display:"block", marginLeft:"auto", marginRight: "auto", maxWidth:"100%"}}/> <br />
        Each capsule contains 29 (!) different variables that inform and change its appearance. Each unique is thus unique, lending itself to different glitches, shades of colours, and marked experiences.
        <br />
        <br />
        <h3>CUSTOM CAPSULES: {props.seedPrice} ETH per mint.</h3> Available to mint, with no supply limit, from {startDateString} until {endDateString}.<br />
        <br />
        To mint a custom capsule, you must choose a seed. The capsule that will be generated is defined by this seed and the address used to mint it. Thus, it remains a unique capsule to you! 
        Each custom capsule is generated from this combined seed to produce 29 unique variables that generates a unique capsule. <b>There are 53 experiences to draw from.</b><br />
        <br />
        Preview the capsule by playing with the number in the form below.
        If you are happy with the result, you can mint it.<br />
        <br />
        <h3> RANDOM CAPSULES: {props.randomPrice} ETH per mint.</h3> Available to mint and claim, with no supply limit, from {startDateString} until {endDateString}.<br />
        <br />
        Can't decide what to mint? Want to be surprised? Mint a random capsule. Along with the 62 experiences, there's a 1/3 chance for each experience that is generated to be from a rare set of experiences (33 experiences)! 
        <b> The rare experiences can only be generated from random mints.</b>
        A rare experience is denoted by a striped line instead of a solid line.
        <br />
        <br />
        To be eligible to claim a capsule for free, you would have had to have owned an NFT from all the previous 3 stories combined by {snapshotDate}. Any amount of capsules can be generated during the campaign period of 4 weeks. 
        After this period, no new ones can be minted or claimed.
        <br />
        <br />
        The components that make up the Capsules are licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Thus, you are free to use the NFTs as you wish. <a href="https://github.com/Untitled-Frontier/ug">The code is available on Github.</a>
        <br />
        <br />
        You can view already minted "Capsules" on <a href="https://opensea.io/collection/capsules-of-all-our-lives" target="_blank">OpenSea</a>.
        <br />
        <br />
        <h2> [] Upstream Glitches </h2>
        These capsules are collectible memorabilia from the fourth story in the Logged Universe: <a href="https://www.untitledfrontier.studio/blog/logged-universe-4-upstream-glitches">"Upstream Glitches" by Vesta Gheibi.</a>  
        <span> In one of the lessons in the simulation's first school of unlearning, Marsa and other uploaded minds, have to capture all the lives they have lived in capsules. </span>
        <br />
        <br />
        <video controls src="https://d2ybmb80bbm9ts.cloudfront.net/Dp/Ys/QmdQoiskPF8iqkVMU4rNteqrCbVtioMuA3F8iXXpHoDpYs/nft_q4.mp4" width="100%">
        Sorry, your browser doesn't support embedded videos.
        </video>
        <i>The cover video as an NFT by Untitled Frontier and Dr. Chicken Gristle and is also <a href="https://foundation.app/@un_frontier/lucs/1">available on Foundation</a>.</i>
        <br />
        <br />
        You can listen to the story here: <br />
        <br />
        <iframe width="560" height="315" src="https://www.youtube.com/embed/e4E2Rr3tAMs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <br />
        <br />
        <br />
        <br />
        </div>
    );
}

export default IntroPage

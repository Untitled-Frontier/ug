import React, { useState, useEffect, Fragment } from "react";
import { Button, Form, Input } from "antd";


import NFTImg from "./splash.png"; 
import CellsComponent from "./CellsComponent";
import { keccak256 } from "ethers/lib/utils";

import { gql, useLazyQuery } from '@apollo/client'

// give a collection address (from params)

function IntroPage(props) {

    const [mintSection, setMintSection] = useState('');
    const [displaySection, setDisplaySection] = useState('');

    // get all the certificates that the owner owns.
    /*const COLLECTION_QUERY = gql`
    query Certs($owner: String!){
      certificates(where: { owner: $owner}) {
        id
        owner
        moaClaimed
      }
    }
    `*/

    const COLLECTION_QUERY = gql`
    query Collection ($owner: String!) { 
      tokenContract(id: "0xabffa842c2e03446ad0cacadf9570bf1a45e2432") {
        id
        tokens (where: {owner: $owner}) {
          tokenID
          tokenURI
        }
      }
    }
    `


    const wrongNetworkHTML = <Fragment>You are on the wrong network. Please switch to mainnet on your web3 wallet and refresh the page.</Fragment>;

    const offlineHTML = <Fragment>
    [In order to mint an NFT, you need to  have a web3/Ethereum-enabled browser and connect it (see top right of the page). Please download
      the <a href="https://metamask.io">MetaMask Chrome extension</a> or open in an Ethereum-compatible browser.]
    </Fragment>;


    const [savedData, setSavedData] = useState(null);
    const [owner, setOwner] = useState(null);

    const [ getCollection, { loading, error, data }] = useLazyQuery(COLLECTION_QUERY, {fetchPolicy: 'network-only'});

    // initial load
    useEffect(() => {
      //getCollection({variables: { owner: props.address.toLowerCase() }}); 
    }, []);

    useEffect(() => {
      if(!!data) {
        if(savedData !== null) {
            setSavedData(data);
        } else { setSavedData(data); }
      }

    }, [data]);

    useEffect(() => {
      if(savedData !== null) {      
        console.log(savedData);
        // set section
        let display = <Fragment>There's nothing here.</Fragment>;
        if(savedData.tokenContract.tokens.length > 0) {
          display = savedData.tokenContract.tokens.map(({ id, tokenURI}) => (
            <div key={id} style={{textAlign: 'center'}}>
                id: {id}. <br />
                {tokenURI}
                <br />
            </div>
          ));
        }
        
        setDisplaySection(display);
      }
    }, [savedData]); 

    useEffect(() => {
        if(typeof props.address !== 'undefined' && props.NFTSigner !== null) {
          console.log(props.address.toLowerCase());
          getCollection({variables: { owner: props.address.toLowerCase() }}); 
        }
    }, [props.address, props.NFTSigner, props.minting]);

    useEffect(() => {
        if(props.injectedChainId !== props.hardcodedChainId && props.injectedChainId !== null) {
          setMintSection(wrongNetworkHTML);
          // set action section
        } else if(props.injectedChainId == null) {
          setMintSection(offlineHTML);
        }
      }, [props.hardcodedChainId, props.NFTSigner]);

    return (

        <div className="App" style={{textAlign:"justify"}}> 
   
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

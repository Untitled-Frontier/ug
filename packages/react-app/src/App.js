import React, { useState, useEffect, Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import 'antd/dist/antd.css';
import { ethers } from "ethers";
import "./App.css";
import { Account } from "./components"

import IntroPage from './components/IntroPage.js';

import { usePoller } from "./hooks";

import Transactor from "./helpers/Transactor.js"; 

import generateTree from "./helpers/merkle_generator.js";

// Artifacts
import NFTJson from "./contracts/Collection.json";

function App() {
  /* Universal State*/
  const [address, setAddress] = useState();
  const [injectedProvider, setInjectedProvider] = useState();
  const [minting, setMinting] = useState(false); // whether something is minting or not

  // chain ids (used as proxy for being connect to a provider)
  const [tokenId, setTokenId] = useState(0); // token Id to display
  const [injectedChainId, setInjectedChainId] = useState(null);
  const [hardcodedChainId, setHardcodedChainId] = useState(null); // set it manually

  let NFTAddress = "0xab387f2826759BbE08eA102d0C067365187648C7";

  // should be changed in contracts, test, UI
  let dfPrice = "0.035"; // ~$100

  const [NFTSigner, setNFTSigner] = useState(null);
  const [tree, setTree] =  useState(null);

  // NOTE: Currently not being used in Transactor, but keeping it in the code in case I want to turn it back on.
  // Currently, it's expected that the web3 provider sets it (eg, MetaMask fills it in).
  // const gasPrice = useGasPrice("fast"); 
  const gasPrice = 0;

  usePoller(()=>{pollInjectedProvider()},1999);

  async function pollInjectedProvider() {
      if(!injectedChainId) {
          if(injectedProvider && injectedProvider.network) {
              const id = await injectedProvider.network.chainId;
              setInjectedChainId(id);

              // comment out line for local or prod
              // setHardcodedChainId(1); // mainnet
              // setHardcodedChainId(4); // rinkeby
              setHardcodedChainId(id); // local (uses injectedProvider)

              // for local testing
              /*console.log('s');
              await injectedProvider.network.provider.send("hardhat_setBalance", [
                "0x0cacc6104d8cd9d7b2850b4f35c65c1ecdeece03",
                "0x10000",
              ]);*/
          }
      }
  } 
  
  // load signers if there's an injected provider
  useEffect(() => {
    async function loadSigners() {
      if(injectedChainId !== null) {
        const signer = await injectedProvider.getSigner();
        const NFTSigner = new ethers.Contract(NFTAddress, NFTJson.abi, signer);
        setNFTSigner(NFTSigner);

        // also load the merkle tree
        const tree =  await generateTree();
        setTree(tree);
      }
    }
    loadSigners();
  }, [injectedChainId]);


  async function mintNFT() {
    let val = ethers.utils.parseEther(dfPrice);
    const tx = Transactor(injectedProvider, gasPrice);
    setMinting(true);
    tx(NFTSigner.functions.mint({value: val}), async function (update) {
      /*Used for testing UI*/
      // await new Promise(resolve => setTimeout(resolve, 5000));
      console.log(update);
      console.log(update.eventCode);
      if(update.eventCode === "txConfirmed" || update.confirmations === 1) {
        const txResponse = await injectedProvider.getTransaction(update.hash);
        console.log(txResponse);
        const receipt = await txResponse.wait();
        console.log(receipt);
        const tokenId = receipt.logs[0].topics[3];
        setTokenId(tokenId);
        setMinting(false);
      }

      /* if user denies tx */
      if(update.code !== undefined) {
        if(update.code === 4001) {
          setMinting(false);
        }

        /* if too high gas limit */
        if(update.code === "UNPREDICTABLE_GAS_LIMIT") {
          setMinting(false);
        }
      }
    });
  }

  async function claim(proof) {
    const tx = Transactor(injectedProvider, gasPrice);
    setMinting(true);
    console.log('proof', proof);
    tx(NFTSigner.functions.loyalMint(proof), async function (update) {
      /*Used for testing UI*/
      // await new Promise(resolve => setTimeout(resolve, 5000));
      console.log(update);
      console.log(update.eventCode);
      console.log(update.code);
      if(update.eventCode === "txConfirmed" || update.confirmations === 1) {
        const txResponse = await injectedProvider.getTransaction(update.hash);
        console.log(txResponse);
        const receipt = await txResponse.wait();
        console.log(receipt);
        const tokenId = receipt.logs[0].topics[3];
        setTokenId(tokenId);
        setMinting(false);
      } 

      if(update.code !== undefined) {
        /* if user denies tx */
        if(update.code === 4001) {
          setMinting(false);
        }

        // already claimed
        if(update.code === -32603) {
          setMinting(false);
        }

        /* if too high gas limit */
        if(update.code === "UNPREDICTABLE_GAS_LIMIT") {
          setMinting(false);
        }
      }
    });
  }

  return (
      <div>
      <Account
        address={address}
        setAddress={setAddress}
        injectedProvider={injectedProvider}
        setInjectedProvider={setInjectedProvider}
      />
      <Switch>
      <Route exact path="/">
          <IntroPage
            address={address}
            NFTSigner={NFTSigner}
            injectedChainId={injectedChainId}
            hardcodedChainId={hardcodedChainId}
            mintNFT={mintNFT}
            claim={claim}
            tokenId={tokenId}
            minting={minting}
            dfPrice={dfPrice}
            tree={tree}
          />
      </Route>
      </Switch>
      </div>
  );
}

class AppRoutes extends Component {
  render() {
    return (
      <Router>
        <Switch>        
          <Route path='/:page'>
            <App />
          </Route>
          <Route exact path='/'>
            <App />
          </Route>
        </Switch>
      </Router>
    )
  }
}

export default AppRoutes;

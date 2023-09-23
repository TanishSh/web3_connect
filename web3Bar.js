// set up top bar based on if they have a web3 provider or not. "Sign in with a web3 provider" or "Account Tags TALK"
    import { ethers } from "../ethers.min.js";
    document.addEventListener('DOMContentLoaded', async () => {
        let topBarElement = document.getElementById('topbar');
        let provider;
        let address;

        // Check if window.ethereum is defined to detect a web3 provider like MetaMask
        if (window.ethereum) {
            try {
                // Request account access
                await window.ethereum.enable();
                provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                address = await signer.getAddress();
            } catch (error) {
                console.error("User denied access to their web3 provider.");
            }
        } else if (window.web3) { // Legacy web3 provider
            provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
        } else { // No web3 provider detected
            provider = null;
        }

        if (provider) {
            // The user has a web3 provider installed

            topBarElement.innerHTML = 
                <div style="display: inline; margin-left: 25px;">
                <a href="https://talk.online/${address}" style="margin-right: 20px;">Account</a>
                <a href="https://talk.online/tags.html" style="margin-right: 20px;">Tags</a>
                <a href="https://talk.online/token.html">TALK</a>
                </div>
            ;

        } else {
            // The user doesn't have a web3 provider installed
            topBarElement.innerHTML = 
                <span><a href="./web3.html" target="_blank">Sign in with a Web3 Provider</a></span>
            
            ;
        }
    });

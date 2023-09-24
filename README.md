# Web3 Forums Project

This [project](https://talk.online/) encompasses seven unique web3 forums, each backed by a triad of smart contracts to govern their functioning.

![Homepage Website](https://storage.googleapis.com/ethglobal-api-production/projects/jqkvd/images/Screenshot%20from%202023-09-24%2001-32-35.png?bustcache=1695543635381)

## Overview

1. **ERC20 Contract**: Establishes a new ERC20 token for the forum. Owners of this token have the power to vote on forum posts. The voting power is directly proportional to the number of tokens held by a user, similar to company shares.

2. **NFT Contract**: Implements the concept of NFTs for the forum. NFT owners have the ability to control fees and token requirements, thus creating a permissioned layer within the otherwise permissionless forum.

3. **Utility Contract**: Provides added utilities for the tokens within the community.

## Features

- **Voting**: ERC20 token holders can vote on posts, with voting power equivalent to their token holdings.

- **Customizability**: The NFT contract allows for a high degree of customizability in terms of fee structures and token requirements.

- **Interactive Interface**: The user interface supports HTML injection, empowering users to craft and introduce their own interactive programs seamlessly.

## Technical Stack

- **Smart Contracts**: Written in Solidity.

- **Interface**: Crafted using HTML, CSS, and JavaScript. Ethers.js library is utilized for web3 integrations.

## Deployment

Our smart contracts have been deployed on the following chains:
- Base
- Arbitrum One
- Filecoin Calibration testnet
- Celo Alfrajores testnet
- Gnosis Chiado testnet
- Mantle testnet
- Scroll alpha testnet

## Contribute

We welcome contributions to enhance the functionality of our forums. Please follow our contribution guidelines and ensure that any changes do not hamper the capability for users to inject HTML.

## License

[MIT License](LICENSE.md)

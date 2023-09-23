import { ethers } from "../ethers.min.js";
import { forumAddress, forumAbi } from './constants.js';
import { getENSName, isURL, handleURL, formatDateForDisplay } from '../helpers.js';

const initializeForumInterface = async (provider, windEth) => {
    const cardContainer = document.getElementById("posts");

    let currentPage = 1;
    const cardIncrease = 8;
    const pageCount = Math.ceil(999 / cardIncrease);

    const createPost = async (index) => {
        const post = document.createElement("article");
        post.className = "post";
        post.id = `post${index}`;
        const forumContract = new ethers.Contract(forumAddress, forumAbi, provider);
        var postNumber = Math.trunc(Math.random() * await forumContract.getForumLength().toNumber());
        var postInfo = await forumContract.getPost(postNumber);
        if (isURL(postInfo[1])) {
            post.innerHTML += await handleURL(postInfo[1]);
        } else {
            post.innerHTML += `<p class = "post-content">${postInfo[1]}</p>`;
        }
        cardContainer.appendChild(post);
    };

    const addCards = async (pageIndex) => {
        const postPromises = Array.from({ length: cardIncrease }, (_, i) => createPost(i + (pageIndex - 1) * cardIncrease + 1));
        await Promise.all(postPromises);
    };

    const handleInfiniteScroll = () => {
        if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
            addCards(++currentPage);
            if (currentPage === pageCount) {
                window.removeEventListener("scroll", handleInfiniteScroll);
            }
        }
    };

    window.onload = () => addCards(currentPage);
    window.addEventListener("scroll", handleInfiniteScroll);
};

document.addEventListener('DOMContentLoaded', async () => {
    let provider;
    let windEth = false;

    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            provider = new ethers.providers.Web3Provider(window.ethereum);
            windEth = true;
        } catch (_) {
            console.error("User denied access.");
        }
    } else if (window.web3) {
        provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
    } else {
        provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
    }

    if (provider) {
        await initializeForumInterface(provider, windEth);
    }
});


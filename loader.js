import { ethers } from "../ethers.min.js";
import { forumAddress, forumAbi, tagAddress, tagAbi, tokenAddress, tokenAbi } from './constants.js';
import { getENSName, isURL, getFileType, handleURL, formatDateForDisplay } from '../helpers.js';

const initializeForumInterface = async (provider, windEth) => {

    const cardContainer = document.getElementById("posts");
    const loader = document.getElementById("loader");

    let currentPage = 1;
    const cardLimit = 999;
    const cardIncrease = 8;
    const pageCount = Math.ceil(cardLimit / cardIncrease);

    let throttleTimer;
    const throttle = (callback, time) => {
        if (throttleTimer) return;
        throttleTimer = true;
        setTimeout(() => {
            callback();
            throttleTimer = false;
        }, time);
    };
    let provider1;
    const createPost = async (index, windEth) => {
            const post = document.createElement("article");
            post.className = "post";
            post.id = `post${index}`;

            // Create the rest of your post structure here and append it to the 'post' element
            const forumContract = new ethers.Contract(forumAddress, forumAbi, provider);
            var forumLength = await forumContract.getForumLength();
            // TODO: this will be where the algo is implemented for now its always random. How will postNumber be determined? Based on which is select in a select html element in the index.html file. may need to include logic in here for how to mange that thing
            var postNumber = Math.trunc(Math.random() * forumLength.toNumber());
            console.log("test");
            var postInfo = await forumContract.getPost(postNumber);
            // TODO: move styling to CSS

            console.log(postNumber);
            // TODO: events don't seem to work with Scroll
          //  const events = await forumContract.queryFilter(forumContract.filters.PostCreated(null, null, (postNumber), null));
          //  console.log(events);

            let dateField = "Day One";
            try{
                // TODO: make this section return the tiem the event occured, not the current blockNumber!
                const blockNumber = events[0].blockNumber;  // Assuming `blockNumber` is an argument in the event
                const block = await provider.getBlock(blockNumber);
                const timestamp = block.timestamp;
                const dateObject = new Date(timestamp * 1000);
                const humanReadableDate = await formatDateForDisplay(dateObject);
                dateField = humanReadableDate;
                console.log(`Event occurred at: ${humanReadableDate}`);
            }
            catch(error){
                console.log("post Event not found could be because its the 0th post");
            }
            provider1 = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
            post.innerHTML += '<header style="text-align: center;">' +
                  '<div style="display: flex; justify-content: space-between;">' +
                  `<span>${dateField}</span>` +
                  `<h3><a href="https://talk.online/${postNumber.toString()}">${postNumber.toString()}</a></h3>` +
                  '</div>' +

                  '<p><span class="author">' + await getENSName(postInfo[0], provider1) + '</span></p>' +
                  '</header>';
            // TODO: indicate the a post is a reply, create some kind of formatting to show
            if(isURL(postInfo[1])){
                post.innerHTML += await handleURL(postInfo[1]);
            } else {
                // not a url, just use it as text
                console.log("text");
                post.innerHTML += `<p class = "post-content">${postInfo[1]}</p>`;
            }

            if (windEth) {
                post.innerHTML += "<footer id = \"givenPostsFooter\"><button class=\"upvote-button\">^</button><button class=\"downvote-button\">v</button><button class=\"tag-button\">Add Tag</button><button class=\"reply-button\">Reply</button>" +
                        `<div class="input-wrapper" hidden><input type="text" class="input-field" placeholder="Enter your tag/reply..."><button class="submit-input">Submit</button></div></footer>`;
            } else {
                post.innerHTML += "<footer id = \"givenPostsFooter\"><button onclick=\"location.href='./web3.html'\" class =\"contribute-button\">Contribute</button></footer>";
            }
            // TODO: dynamically generate tags by querying PostTagged event for the given post
            post.innerHTML += "<p>Score: <span class=\"score\">" + (postInfo[2] - postInfo[3]).toString() + "</span></p><p class=\"tags\">Tags: <span class=\"tag\">tag1</span>, <span class=\"tag\">tag2</span></p>" + `<p>Replies:` + postInfo[4].length.toString() + "</p>";

            cardContainer.appendChild(post);
            return post;
    };

    const addCards = async(pageIndex) => {
            currentPage = pageIndex;

            const startRange = (pageIndex - 1) * cardIncrease;
            const endRange =
            currentPage == pageCount ? cardLimit : pageIndex * cardIncrease;

            const postPromises = [];
            for (let i = startRange + 1; i <= endRange; i++) {
                postPromises.push(createPost(i, windEth));
            }
            const posts = await Promise.all(postPromises);
            posts.forEach(post => cardContainer.appendChild(post));
            console.log("adding cards");
            // TODO: make a post show the OG message (postID = 0). To do so we will need to adjust the post with the id post1 so that it says the welcome message instead of what it may have already been assigned.
            if (!localStorage.getItem('hasVisited')) {
                // This is a first-time visitor.
                localStorage.setItem('hasVisited', 'true');
                // Do something special for first-time visitor.
                const welcomePost = document.getElementById('post1');
                console.log(welcomePost);
                console.log('Hello, first-time visitor!');
            } else {
                // This is a returning visitor.
                console.log('Hello, returning visitor!');
            }

    };

    const handleInfiniteScroll = () => {
            throttle(() => {
                const endOfPage =
                window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

                if (endOfPage) {
                    addCards(currentPage + 1);
                }

                if (currentPage === pageCount) {
                    removeInfiniteScroll();
                }
            }, 1000);

    };

    const removeInfiniteScroll = () => {
            loader.remove();
            window.removeEventListener("scroll", handleInfiniteScroll);

    };

    window.onload = () => {
        handleInfiniteScroll();
        addCards(currentPage);
    };

    window.addEventListener("scroll", handleInfiniteScroll);
};

document.addEventListener('DOMContentLoaded', async () => {
    let provider;
    let windEth;
    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            document.getElementById("create-post").removeAttribute("hidden");
            document.getElementById("algos").innerHTML += `<option value="recs">Recommended</option>`;
            windEth = true;
            await initializeForumInterface(provider, windEth);
            let signer;
            try {
                const signer = provider.getSigner();
                document.getElementById('create-post-form').addEventListener('submit', async (e) => {
                    // Prevent the default form submission
                    e.preventDefault();

                    // Get the post content from the textarea
                    const postContent = document.getElementById('post-content').value;

                    if (!postContent.trim()) {
                        alert("Post content is empty. Please write something.");
                        return;
                    }

                    // Create a new post by calling the `createPost` function on the contract
                    const forumContract = new ethers.Contract(forumAddress, forumAbi, signer);

                    try {
                        // Send the transaction and wait for it to be mined
                        let tx = await forumContract.createPost(postContent, 0);
                        let receipt = await tx.wait();
                        console.log('Transaction has been mined: ', receipt.transactionHash);

                        // Clear the textarea after successful post creation
                        document.getElementById('post-content').value = '';
                    } catch (error) {
                        // Handle any errors
                        console.error('An error occurred:', error);
                    }
                });
                // TODO: functionality for buttons. Add Tag and Reply unhide an empty message box if field is empty, submit if field is filled.
                let action;
                document.addEventListener('click', async (e) => {
                    const postElement = e.target.closest('article');  // Find the parent article
                    if (!postElement) return;  // If clicked outside a post, exit

                    // Fetch the post ID from the link in the post header
                    const postIDLink = postElement.querySelector('header h3 a');
                    if (!postIDLink) return;  // If the link isn't found, exit

                    const postID = postIDLink.textContent;
                    console.log(postID);
                    const forumContract = new ethers.Contract(forumAddress, forumAbi, signer);
                    // Check if the 'Add Tag' or 'Reply' buttons were clicked
                    if (e.target.classList.contains('tag-button')) {
                        const inputWrapper = postElement.querySelector('.input-wrapper');
                        const inputField = postElement.querySelector('.input-field');
                        inputWrapper.toggleAttribute('hidden'); // Toggle visibility
                        inputField.focus(); // Focus on the field for immediate typing
                        action = "tag";

                    }
                    else if (e.target.classList.contains('reply-button')){
                        const inputWrapper = postElement.querySelector('.input-wrapper');
                        const inputField = postElement.querySelector('.input-field');
                        inputWrapper.toggleAttribute('hidden'); // Toggle visibility
                        inputField.focus(); // Focus on the field for immediate typing
                        action = "reply";

                    }
                    else if (e.target.classList.contains('upvote-button')){
                        forumContract.upvotePost(postID);
                    }
                    else if (e.target.classList.contains('downvote-button')){
                        forumContract.downvotePost(postID);
                    }
                    else if (e.target.classList.contains('submit-input')) {
                        const inputField = postElement.querySelector('.input-field');
                        const inputValue = inputField.value.trim();
                        console.log(action);
                        if (inputValue && action) {
                            if(action == "reply"){
                                forumContract.createPost(inputValue, postID);
                            }
                            else if(action == "tag"){
                                try{
                                    forumContract.tagPost(postID, inputField);
                                } catch(error){
                                    console.log("probably an invalid tag");
                                }
                                console.log("TagTime");
                            }
                            // Send your request with the inputValue
                            // For example:
                            // await sendTagOrReply(inputValue);

                            inputField.value = ''; // Clear the input field after sending the request
                        } else {
                            alert('Please enter a valid tag or reply.');
                        }
                    }

                });

            } catch (error) {
                console.error("Unable to get signer:", error);
                const signer = null;
            }

        } catch (error) {
            console.error("User denied access to their web3 provider.");
        }
    } else if (window.web3) { // Legacy web3 provider
        provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
    } else { // No web3 provider detected
        provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
        windEth = false;
    }

    if (provider && !windEth) {
        await initializeForumInterface(provider, windEth);
    }
});

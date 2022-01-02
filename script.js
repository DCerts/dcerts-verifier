const HTTP_PROVIDER = 'http://localhost:8545';
const CONTRACT_INFO_URL = 'http://localhost:3000/contracts/Certs.json';


async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
    }
    else {
        window.web3 = new Web3(new Web3.providers.HttpProvider(HTTP_PROVIDER));
    }
}

async function getContract() {
    const response = await new Promise(async function (resolve) {
        const netId = await web3.eth.net.getId();
        const request = new XMLHttpRequest();
        request.responseType = 'json';
        request.onload = function (e) {
            if (this.status == 200) {
                resolve({
                    abi: this.response.abi,
                    address: this.response.networks[netId].address
                });
            }
        };
        request.open('GET', CONTRACT_INFO_URL);
        request.send();
    });
    window.contract = new web3.eth.Contract(response.abi, response.address);
}

async function getAccounts() {
    window.accounts = await web3.eth.getAccounts();
}


window.onload = async function () {
    await loadWeb3();
    await getAccounts();
    await getContract();
};
console.log('Hanoi, Feb. 10th, 2022')

const HTTP_PROVIDER = 'http://rinkeby.infura.io/v3/c690146f1ff145f096edbb6f90579fa6';
const CONTRACT_INFO_URL = window.location.pathname.replace('/index.html', '') + '/Certs.json';
const SCHOOL_LIST_URL = window.location.pathname.replace('/index.html', '') + '/schools.json';


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
    contractAddress.innerHTML = response.address;
}

async function getSchools() {
    const response = await fetch(SCHOOL_LIST_URL, {
        method: 'GET'
    });
    window.schools = await response.json();
}

async function getAccounts() {
    window.accounts = await web3.eth.getAccounts();
}

const contractAddress = document.getElementById('cert-version');
const schoolIdInput = document.getElementById('school-address-input');
const certIdInput = document.getElementById('cert-on-chain-id-input');
const searchButton = document.getElementById('search-button');
const certInfo = document.getElementById('cert-info');
const errorPane = document.getElementById('error-pane');

searchButton.onclick = async function () {
    try {
        displayCertInfo(await getCertInfo());
    } catch (err) {
        certInfo.innerHTML = '';
        displayError('Something went wrong!', err.message);
    }
};

function displayCertInfo(cert) {
    if (!cert.regNo) throw new Error(`Certificate didn't exist!`);
    const backgroundElement = document.createElement('div');
    backgroundElement.className = 'back';
    backgroundElement.onclick = function () {
        certInfo.innerHTML = '';
    };
    const infoElement = document.createElement('div');
    infoElement.className = 'container';
    infoElement.innerHTML = (`
        <div class="id">#${cert.id}</div>
        <div class="title">${cert.regNo}</div>
        <div class="text">
            <div>Batch: <span>${cert.batchRegNo}</span></div>
            <div>Conferred On: <span>${cert.conferredOn}</span></div>
            <div>Date of Birth: <span>${cert.dateOfBirth}</span></div>
            <div>Year of Graduation: <span>${cert.yearOfGraduation}</span></div>
            <div>Major In: <span>${cert.majorIn}</span></div>
            <div>Degree Of: <span>${cert.degreeOf}</span></div>
            <div>Degree Classification: <span>${cert.degreeClassification}</span></div>
            <div>Mode of Study: <span>${cert.modeOfStudy}</span></div>
            <div>Created In: <span>${cert.createdIn}</span></div>
            <div>Created At: <span>${cert.createdAt}</span></div>
        </div>
    `);
    certInfo.appendChild(backgroundElement);
    certInfo.appendChild(infoElement);
}

function displayError(title, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.innerHTML = (`
        <div class="title">${title}</div>
        <div class="text">${message}</div>
    `);
    errorPane.appendChild(errorElement);
    setTimeout(function () {
        errorPane.removeChild(errorElement);
    }, 4000);
}

async function getCertInfo() {
    const schoolAddress = schoolIdInput.value;
    const certId = certIdInput.value;
    if (window.contract) {
        return window.contract.methods.getCert(schoolAddress, certId).call();
    }
}


window.onload = async function () {
    await loadWeb3();
    await getAccounts();
    await getContract();
    await getSchools();
};


const SERVER_URL = 'http://localhost:3001/api';

const logIn = async (credentials) => {
    return await fetch(SERVER_URL + '/sessioni', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    }).then(handleInvalidResponse)
    .then(response => response.json());
};

const getUserInfo = async () => {
    return await fetch(SERVER_URL + '/sessioni/corrente', {
        credentials: 'include'
    }).then(handleInvalidResponse)
    .then(response => response.json());
};

const logOut = async() => {
    return await fetch(SERVER_URL + '/sessioni/corrente', {
      method: 'DELETE',
      credentials: 'include'
    }).then(handleInvalidResponse);
}

// ottengo lista di {id, username} di tutti gli utenti
async function getUtenti() {
    return await fetch(SERVER_URL + '/utenti', {
        method: 'GET',
        credentials: 'include'
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
}

// BUDGET
async function createBudget(budget) {
    return await fetch(SERVER_URL + '/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(budget)
    }).then(handleInvalidResponse);
}

async function getBudget() {
    return await fetch(SERVER_URL + '/budget', {
        method: 'GET',
        credentials: 'include'
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
}

async function deleteBudget() {
    return await fetch(SERVER_URL + '/budget', {
        method: 'DELETE',
        credentials: 'include'
    }).then(handleInvalidResponse);
}

// FASE
async function createFase() {
    return await fetch(SERVER_URL + '/fase', {
        method: 'POST',
        credentials: 'include'
    }).then(handleInvalidResponse);
}

async function getFase() {
    return await fetch(SERVER_URL + '/fase', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
}

async function deleteFase() {
    return await fetch(SERVER_URL + '/fase', {
        method: 'DELETE',
        credentials: 'include'
    }).then(handleInvalidResponse);
}

async function editFase(fase) {
    return await fetch(SERVER_URL + '/fase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(fase)
    }).then(handleInvalidResponse);
}

// PROPOSTE
async function createProposta(proposta) {
    return await fetch(SERVER_URL + '/proposte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(proposta)
    }).then(handleInvalidResponse);
}

async function getProposte() {
    return await fetch(SERVER_URL + '/proposte', {
        method: 'GET',
        credentials: 'include'
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
}

async function getProposta(idProposta) {
    return await fetch(SERVER_URL + '/proposte/' + idProposta, {
        method: 'GET',
        credentials: 'include'
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
}

async function getProposteUtente(idUtente) {
    return await fetch(SERVER_URL + '/utenti/'+ idUtente +'/proposte', {
        method: 'GET',
        credentials: 'include'
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
}

async function editProposta(proposta) {
    return await fetch(SERVER_URL + '/proposte/' + proposta.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(proposta)
    }).then(handleInvalidResponse);
}

async function deleteProposta(idProposta) {
    return await fetch(SERVER_URL + '/proposte/' + idProposta, {
        method: 'DELETE',
        credentials: 'include'
    }).then(handleInvalidResponse);
}

async function deleteAllProposte() {
    return await fetch(SERVER_URL + '/proposte', {
        method: 'DELETE',
        credentials: 'include'
    }).then(handleInvalidResponse);
}

// PREFERENZE
async function createPreferenza(preferenza) {
    return await fetch(SERVER_URL + '/proposte/' + preferenza.idProposta + '/preferenze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(preferenza)
    }).then(handleInvalidResponse);
}

async function deletePreferenza(idProposta) {
    return await fetch(SERVER_URL + '/proposte/' + idProposta + '/preferenze', {
        method: 'DELETE',
        credentials: 'include'
    }).then(handleInvalidResponse);
}

async function editPreferenza(preferenza) {
    return await fetch(SERVER_URL + '/proposte/' + preferenza.idProposta + '/preferenze', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(preferenza)
    }).then(handleInvalidResponse);
}

async function getPreferenzeProposta(idProposta) {
    return await fetch(SERVER_URL + '/proposte/' + idProposta + '/preferenze', {
        method: 'GET',
        credentials: 'include'
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
}

async function getListaPreferenze() {
    return await fetch(SERVER_URL + '/preferenze', {
        method: 'GET',
        credentials: 'include'
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
}

async function deleteAllPreferenze() {
    return await fetch(SERVER_URL + '/preferenze', {
        method: 'DELETE',
        credentials: 'include'
    }).then(handleInvalidResponse);
}

function handleInvalidResponse(response) {
    if (!response.ok) { throw Error(response.statusText) }
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1){
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    return response;
}

const API = { logIn, getUserInfo, logOut, getUtenti, createBudget, getBudget, deleteBudget, createFase, getFase, deleteFase, editFase, 
    createProposta, getProposte, getProposta, deleteProposta, getProposteUtente, editProposta, deleteProposta, deleteAllProposte, 
    createPreferenza, deletePreferenza, editPreferenza, getPreferenzeProposta, getListaPreferenze, deleteAllPreferenze };
export default API;

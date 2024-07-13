let friends = {};
let items = [];

function addFriend() {
    const name = document.getElementById('friend-name').value.trim();
    if (name && !friends[name]) {
        friends[name] = { paid: 0, owed: 0 };
        updateFriendsList();
        updateFriendCheckboxes();
        updatePaidByCheckboxes();
        document.getElementById('friend-name').value = '';
    }
}

function updateFriendsList() {
    const friendsList = document.getElementById('friends-list');
    friendsList.innerHTML = '';
    for (let name in friends) {
        const li = document.createElement('li');
        li.textContent = name;
        friendsList.appendChild(li);
    }
}

function updateFriendCheckboxes() {
    const checkboxes = document.getElementById('friend-checkboxes');
    checkboxes.innerHTML = '';
    for (let name in friends) {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" name="participants" value="${name}"> ${name}`;
        checkboxes.appendChild(label);
    }
}

function updatePaidByCheckboxes() {
    const checkboxes = document.getElementById('paid-by-checkboxes');
    checkboxes.innerHTML = '';
    for (let name in friends) {
        const label = document.createElement('label');
        label.innerHTML = `<input type="radio" name="paidBy" value="${name}"> ${name}`;
        checkboxes.appendChild(label);
    }
}

function addItem() {
    const itemName = document.getElementById('item-name').value.trim();
    const itemCost = parseFloat(document.getElementById('item-cost').value);
    const paidBy = document.querySelector('input[name="paidBy"]:checked')?.value;
    const participants = Array.from(document.querySelectorAll('input[name="participants"]:checked')).map(el => el.value);

    if (itemName && !isNaN(itemCost) && paidBy && participants.length) {
        items.push({ itemName, itemCost, paidBy, participants });
        friends[paidBy].paid += itemCost;

        const sharePerPerson = itemCost / participants.length;
        participants.forEach(participant => {
            friends[participant].owed += sharePerPerson;
        });

        updateItemsList();
        document.getElementById('item-name').value = '';
        document.getElementById('item-cost').value = '';
        document.querySelectorAll('input[name="participants"]').forEach(el => el.checked = false);
        document.querySelector('input[name="paidBy"]:checked').checked = false;
    }
}

function updateItemsList() {
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.itemName} - $${item.itemCost.toFixed(2)} (Paid by: ${item.paidBy})`;
        itemsList.appendChild(li);
    });
}

function calculateBalances() {
    const output = document.getElementById('output');
    output.innerHTML = '<h2>Final Balances:</h2>';

    const creditors = [];
    const debtors = [];

    for (let name in friends) {
        const balance = friends[name].paid - friends[name].owed;
        const div = document.createElement('div');
        div.textContent = `${name}: ${balance >= 0 ? 'is owed $' : 'owes $'}${Math.abs(balance).toFixed(2)}`;
        output.appendChild(div);

        if (balance > 0) {
            creditors.push({ balance, name });
        } else if (balance < 0) {
            debtors.push({ balance: -balance, name });
        }
    }

    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => b.balance - a.balance);

    output.innerHTML += '<h2>Settlements:</h2>';

    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];

        const settlementAmount = Math.min(creditor.balance, debtor.balance);
        creditor.balance -= settlementAmount;
        debtor.balance -= settlementAmount;

        const div = document.createElement('div');
        div.textContent = `${debtor.name} has to pay $${settlementAmount.toFixed(2)} to ${creditor.name}`;
        output.appendChild(div);

        if (creditor.balance === 0) {
            i++;
        }

        if (debtor.balance === 0) {
            j++;
        }
    }
}

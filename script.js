'use strict';

/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2025-05-08T14:11:59.604Z',
    '2025-06-30T17:01:17.194Z',
    '2025-07-01T00:36:17.929Z',
    '2025-07-02T00:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2025-06-10T14:43:26.374Z',
    '2025-06-21T18:49:59.371Z',
    '2025-06-23T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTransfer = document.querySelector('.transfer_label');
const labelLoan = document.querySelector('.label_loan');
const labelClose = document.querySelector('.labelClose');
const labelTimer = document.querySelector('.timer');
const loginForm = document.querySelector('.login');
const transferForm = document.querySelector('.form--transfer');
const loanForm = document.querySelector('.form--loan');
const closeForm = document.querySelector('.form--close');
const operationTransfer = document.querySelector('.operation--transfer');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnLogout = document.querySelector('.logout__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//creating user name
const createUserName = function (accs) {
  accs.forEach(acc => {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
createUserName(accounts);

//date function
const dateCreation = function (dates, locale) {
  //days passed function
  const hoursPassed = (date1, date2) =>
    Math.round(Math.abs(+date1 - +date2) / (1000 * 3600));
  const numberOfHours = hoursPassed(new Date(), dates);

  const hour = String(dates.getHours()).padStart(2, 0);
  const minute = String(dates.getMinutes()).padStart(2, 0);
  const seconds = String(dates.getSeconds()).padStart(2, 0);
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  if (numberOfHours < 1) return `Just Now at ${hour}:${minute}:${seconds}`;
  if (numberOfHours < 24)
    return `${numberOfHours} Hours Ago at ${hour}:${minute}:${seconds}`;
  if (numberOfHours < 48) return `Yesterday at ${hour}:${minute}:${seconds}`;
  if (numberOfHours < 72) return `2 Days Ago at ${hour}:${minute}:${seconds}`;
  else {
    return new Intl.DateTimeFormat(locale, options).format(dates);
  }
};

//formatting currency and numbers
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//setting up the timer
const setLogOutTimer = function () {
  //set a time
  let time = 300;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    labelTimer.textContent = `${min}:${sec}`;

    //hit 0 then logout
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
      currentAccount = null;
      toggleLoginSection();
    }
    //decrease time
    time--;
  };
  //for immediate start of the logout timer otherwise it starts 2 seconds delay
  tick();
  //print the time every sec
  const timer = setInterval(tick, 1000);
  return timer; // return it to use in other function
};

//displaying movement
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  //creating an array with movement and movement dates
  const movementValuesAndDates = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: acc.movementsDates[i],
  }));
  if (sort) {
    movementValuesAndDates.sort((a, b) => a.movement - b.movement);
  }

  // const sortMovements = sort
  //   ? acc.movements.slice().sort((a, b) => a - b)
  //   : acc.movements;

  movementValuesAndDates.forEach((obj, i) => {
    const { movement, movementDate } = obj;
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    //date update
    const individualDates = movementDate;
    const transactionDates = dateCreation(
      new Date(individualDates),
      acc.locale
    );
    //number format
    const specificFormatNumber = formatCurrency(
      movement,
      acc.locale,
      acc.currency
    );
    //movement update
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${transactionDates}</div>
          <div class="movements__value">${specificFormatNumber}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//displaying current balance
const displayCurrentBalance = function (acc) {
  acc.balance = acc.movements.reduce((accu, curr) => accu + curr, 0);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

//display summary
const deposit = move => move > 0;
const displaySummary = function (acc) {
  //deposits
  acc.deposits = acc.movements
    .filter(deposit)
    .reduce((accu, curr) => accu + curr, 0);
  labelSumIn.textContent = formatCurrency(
    acc.deposits,
    acc.locale,
    acc.currency
  );

  //withdrawal
  acc.withdrawals = Math.abs(
    acc.movements
      .filter(move => move < 0)
      .reduce((accu, curr) => accu + curr, 0)
  );
  labelSumOut.textContent = formatCurrency(
    acc.withdrawals,
    acc.locale,
    acc.currency
  );

  //interest
  acc.interests = acc.movements
    .filter(deposit)
    .map(move => move * (acc.interestRate / 100))
    .filter(move => move >= 1)
    .reduce((accu, curr) => accu + curr, 0);
  labelSumInterest.textContent = formatCurrency(
    acc.interests,
    acc.locale,
    acc.currency
  );
};

//toggle login interface
const toggleLoginSection = function () {
  inputLoginUsername.classList.toggle('hidden');
  inputLoginPin.classList.toggle('hidden');
  btnLogin.classList.toggle('hidden');
  btnLogout.classList.toggle('hidden');
};

//clearing input fields
const resetAllInputs = function () {
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => (input.value = ''));
};

//Updating UI
const updateUI = function (acc) {
  //displaying movement

  displayMovements(acc);

  //displaying current balance

  displayCurrentBalance(acc);

  //display summary

  displaySummary(acc);
};

//implementing login
let currentAccount;
let clearLogoutTimer; //creating a gc so that we can save here the timer info of previous logged in account

btnLogin.addEventListener('click', function (event) {
  event.preventDefault();
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Please Wait....`;
    loginForm.classList.add('hidden');
    setTimeout(function () {
      labelWelcome.textContent = `Welcome Back, ${
        currentAccount.owner.split(' ')[0]
      }`;
      loginForm.classList.remove('hidden');

      //creating date
      setInterval(function () {
        const now = new Date();
        // const locale = navigator.language;
        const options = {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          month: 'long',
          day: '2-digit',
          year: 'numeric',
          weekday: 'short',
        };
        const internationalDate = new Intl.DateTimeFormat(
          currentAccount.locale,
          options
        ).format(now);
        labelDate.textContent = internationalDate;
      }, 1000);

      containerApp.style.opacity = 1;
      //update ui
      updateUI(currentAccount);
      //reset input fields
      resetAllInputs();
      //toggle login section
      toggleLoginSection();

      //clearing the existing timer
      if (clearLogoutTimer) clearInterval(clearLogoutTimer);
      //create new logout timer
      clearLogoutTimer = setLogOutTimer();
    }, 3000);
  } else {
    labelWelcome.textContent = `Incorrect Username and Password`;
    loginForm.classList.add('hidden');
    resetAllInputs();
    setTimeout(function () {
      labelWelcome.textContent = `Log in to get started`;
      loginForm.classList.remove('hidden');
    }, 2000);
  }
});

//implementing transfers
btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();
  const amount = Math.floor(+inputTransferAmount.value);
  const receiverAccount = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );

  if (
    amount >= 10 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.userName !== currentAccount.userName
  ) {
    labelTransfer.textContent =
      'Please have a tea while we process your request';
    transferForm.classList.add('hidden');

    setTimeout(function () {
      labelTransfer.textContent = '';

      // create verification form
      const newHTML = `<div class="verification_form">
        <h2 class="verify_label">Please provide your pin to verify.</h2>
        <form class="verify_form">
          <input
            type="password"
            placeholder="Pin"
            maxlength="4"
            class="form__input_transfer transfer__input--pin"
          />
          <button class="verify__btn">&rarr;</button>
        </form>
      </div>`;

      operationTransfer.insertAdjacentHTML('afterbegin', newHTML);

      // elements
      const mainVerificationForm = document.querySelector('.verification_form');
      const btnVerify = document.querySelector('.verify__btn');
      const labelVerify = document.querySelector('.verify_label');
      const formInputTransfer = document.querySelector('.form__input_transfer');

      // event listener: password verification
      btnVerify.addEventListener('click', function (event) {
        event.preventDefault();
        formInputTransfer.classList.add('hidden');
        btnVerify.classList.add('hidden');

        if (currentAccount.pin === +formInputTransfer.value) {
          labelVerify.textContent = `We are verifying your request. Thank you for your patience`;

          setTimeout(function () {
            labelVerify.textContent = `Congratulations your transfer to ${receiverAccount.owner} is successful`;
            currentAccount.movements.push(-amount);
            receiverAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());
            receiverAccount.movementsDates.push(new Date().toISOString());

            // update UI
            updateUI(currentAccount);

            // reset inputs
            resetAllInputs();

            //resetting the existing timer
            clearInterval(clearLogoutTimer);
            //create new logout timer
            clearLogoutTimer = setLogOutTimer();

            setTimeout(function () {
              mainVerificationForm.classList.add('hidden');
              transferForm.classList.remove('hidden');
              labelTransfer.textContent = 'Transfer money';
            }, 3500);
          }, 3000);
        } else {
          labelTransfer.textContent = `Invalid Transfer. Please provide correct username and a valid amount.`;
          mainVerificationForm.classList.add('hidden');
          transferForm.classList.add('hidden');
          resetAllInputs();
          //resetting the existing timer
          clearInterval(clearLogoutTimer);
          //create new logout timer
          clearLogoutTimer = setLogOutTimer();

          setTimeout(function () {
            labelTransfer.textContent = 'Transfer money';
            transferForm.classList.remove('hidden');
          }, 2500);
        }
      });
    }, 2500); // verification form delay
  }
});

//implementing loan
btnLoan.addEventListener('click', function (event) {
  event.preventDefault();
  const loanAmount = Math.floor(+inputLoanAmount.value);
  // valid loan
  if (
    loanAmount > 10 &&
    currentAccount.movements.some(move => move * 0.25 >= loanAmount)
  ) {
    //reviewing
    labelLoan.textContent = `${currentAccount.owner}, We are reviewing your request. `;
    loanForm.classList.add('hidden');
    setTimeout(function () {
      labelLoan.textContent = `Congratulations ${currentAccount.owner}, You have received ${loanAmount} ${currentAccount.currency}.`;
      currentAccount.movements.push(loanAmount);
      currentAccount.movementsDates.push(new Date().toISOString());
      //update ui
      updateUI(currentAccount);
      //reset input fields
      resetAllInputs();
      //resetting the existing timer
      clearInterval(clearLogoutTimer);
      //create new logout timer
      clearLogoutTimer = setLogOutTimer();
      setTimeout(function () {
        labelLoan.textContent = `Request loan`;
        loanForm.classList.remove('hidden');
      }, 2500);
    }, 3000);
  } else if (loanAmount < 10) {
    labelLoan.textContent = `You need to request a loan that is more than 10 ${currentAccount.currency}`;
    loanForm.classList.add('hidden');
    resetAllInputs();
    setTimeout(function () {
      labelLoan.textContent = 'Request loan';
      loanForm.classList.remove('hidden');
    }, 3000);
  } else {
    //invalid loan
    labelLoan.textContent = `Sorry! You're only allowed to get 25% of your deposits`;
    loanForm.classList.add('hidden');
    resetAllInputs();
    //resetting the existing timer
    clearInterval(clearLogoutTimer);
    //create new logout timer
    clearLogoutTimer = setLogOutTimer();
    setTimeout(function () {
      labelLoan.textContent = 'Request loan';
      loanForm.classList.remove('hidden');
    }, 3000);
  }
});

//close account
btnClose.addEventListener('click', function (event) {
  event.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.userName &&
    +inputClosePin.value === currentAccount.pin
  ) {
    labelClose.textContent = `Please wait while we close your account`;
    closeForm.classList.add('hidden');
    setTimeout(function () {
      setTimeout(() => {
        alert(
          `${currentAccount.owner}, We are sorry to see you go. If you want to reactivate your account just refresh the page`
        );
      }, 500);
      const index = accounts.findIndex(
        acc => acc.userName === currentAccount.userName
      );
      accounts.splice(index, 1);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
      //toggle login section
      toggleLoginSection();
      //reset input fields
      resetAllInputs();
    }, 3000);
  } else {
    labelClose.textContent = `Incorrect Username or Password`;
    closeForm.classList.add('hidden');
    resetAllInputs();
    setTimeout(function () {
      labelClose.textContent = `Close account`;
      closeForm.classList.remove('hidden');
    }, 2500);
  }
});

//sorting
let sortedState = false;
btnSort.addEventListener('click', function (event) {
  event.preventDefault();
  sortedState = !sortedState;
  displayMovements(currentAccount, sortedState);
});

//logout
btnLogout.addEventListener('click', function (event) {
  event.preventDefault();
  labelWelcome.textContent = `Logging Out...`;
  setTimeout(function () {
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
    currentAccount = null;
    toggleLoginSection();
  }, 2000);
});

/* keno sort er copy korinai explanation:
if (sort) {
    movementValuesAndDates.slice().sort((a, b) => a.movement - b.movement);
  } sort kaj krbena

তুমি slice() ইউজ করো ঠিকই, কিন্তু sort করার আগে না যে data fetch হচ্ছে সেটা updateUI() call এর মাধ্যমে বারবার নতুন হয়ে আসছে।
তাই sort করার জন্য separate state manage করতে হবে। নিচে full optimized approach দিচ্ছি:

অতিরিক্ত টিপস:
sortedState variable টা globally declare করা জরুরি, যাতে toggle বোধগম্য হয়।
.slice() দিয়ে shallow copy তৈরি করলে তুমি original order safe রাখতে পারো।
UI display তে সব সময় immutable pattern follow করাটাই best.
তুমি যখন displayMovements() call করো, তখন sortedState এর মান (value) sort নামে function parameter-এ copy হয়ে যায়. // এখানে `sort` এর মান হয় `sortedState` এর বর্তমান মান . ধরো, তখন sortedState = true
তখন sort = true হয়, কারণ তুমি sortedState এর value pass করছো (reference না)।

এবং হ্যাঁ, sortedState এর মান তখন true হয়েই থাকে global scope এ।


const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  // Always create new array (immutable)
  const movementValuesAndDates = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: acc.movementsDates[i],
  }));

  const sortedMovements = sort
    ? movementValuesAndDates.slice().sort((a, b) => a.movement - b.movement)
    : movementValuesAndDates;

  sortedMovements.forEach((obj, i) => {
    const { movement, movementDate } = obj;
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const transactionDates = dateCreation(
      new Date(movementDate),
      acc.locale
    );

    const specificFormatNumber = formatCurrency(
      movement,
      acc.locale,
      acc.currency
    );

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${transactionDates}</div>
          <div class="movements__value">${specificFormatNumber}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

 */

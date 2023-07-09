import inquirer from 'inquirer';
import datePrompt from 'inquirer-date-prompt';

inquirer.registerPrompt('date', datePrompt);

const maxAmountWithCreditHistory = {
  1: 15000,
  2: 25000,
  3: 50000,
  4: 100000,
};

const maxAmountWithoutCreditHistory = {
  1: 7500,
  2: 12000,
  3: 30000,
  4: 50000,
};

const isValidName = (input) => {
  if (!input) {
    return 'Ingrese un nombre valido';
  }
  return true;
};

const isValidRFC = (input) => {
  if (!input) {
    return 'Ingrese un RFC valido';
  }
  return true;
};

const isPositiveNumber = (input) => {
  if (!input || isNaN(input)) {
    return 'Ingrese un numero valido';
  }

  if (input <= 0) {
    return 'Ingrese un numero positivo';
  }

  return true;
};

const calculateAge = ({ date }) => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const month = today.getMonth() - date.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age;
};

const isAdult = ({ age }) => {
  if (age >= 18) {
    return true;
  }
  console.log(
    '|=================================================================| \n',
    'La solicitud ha sido rechazada. El cliente es menor de edad',
    '\n|=================================================================|'
  );
  return false;
};

import creditInformation from '../credit-history.json' assert { type: 'json' };
const findUserByRFC = (rfc) =>
  creditInformation.find((user) => {
    return user.rfc.toUpperCase() === rfc.toUpperCase();
  });

const hasActiveCreditRequest = ({ rfc }) => {
  const user = findUserByRFC(rfc);
  if (user) {
    return user.hasActiveProcess;
  }

  return false;
};

const hasCreditHistory = ({ rfc }) => {
  const user = findUserByRFC(rfc);

  if (user) {
    const today = new Date();
    const approvalDate = new Date(user.date);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);

    if (approvalDate.getTime() >= twoYearsAgo.getTime()) {
      return user.approved;
    }
  }

  return false;
};

const approvalMsg = ({ amount }) => {
  console.log(
    '|=================================================================| \n',
    `La solicitud ha sido aprobada. Se aprueba un monto de ${amount} MXN para el cliente`,
    '\n|=================================================================|'
  );
};

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Cual es su nombre?',
      validate: isValidName,
    },
    {
      type: 'input',
      name: 'rfc',
      message: 'Ingrese su RFC:',
      validate: isValidRFC,
    },
    {
      type: 'date',
      name: 'date',
      message: 'Seleccione su fecha de nacimiento:',
    },
    {
      type: 'input',
      name: 'amount',
      message: 'Cuanto desea solicitar de crédito? (MXN)',
      validate: isPositiveNumber,
    },
    {
      type: 'rawlist',
      name: 'earnings',
      message: 'Seleccione dentro de que rango esta su ingreso mensual (MXN)',
      choices: [
        {
          value: 1,
          name: '5,000.00 - 9,999.99 MXN',
        },
        {
          value: 2,
          name: '10,000.00 - 19,999.99 MXN',
        },
        {
          value: 3,
          name: '20,000.00 - 39,999.99 MXN',
        },
        {
          value: 4,
          name: '40,000.00 MXN o mas',
        },
      ],
    },
  ])
  .then((answers) => {
    const userData = {
      name: answers.name,
      rfc: answers.rfc.toUpperCase(),
      date: answers.date,
      amount: answers.amount,
      earnings: answers.earnings,
      age: 0,
    };

    userData.age = calculateAge(userData);

    if (isAdult(userData)) {
      if (hasCreditHistory(userData)) {
        if (userData.amount <= maxAmountWithCreditHistory[userData.earnings]) {
          if (hasActiveCreditRequest(userData)) {
            return console.log(
              '|=================================================================| \n',
              'La solicitud ha sido rechazada. El cliente cuenta con una solicitud en proceso',
              '\n|=================================================================|'
            );
          }
          return approvalMsg(userData);
        }
        return console.log(
          '|=================================================================| \n',
          `La solicitud ha sido rechazada. Usted cuenta con historial crediticio el importe máximo debe ser ${
            maxAmountWithCreditHistory[userData.earnings]
          }`,
          '\n|=================================================================|'
        );
      }
      if (userData.amount <= maxAmountWithoutCreditHistory[userData.earnings]) {
        if (hasActiveCreditRequest(userData)) {
          return console.log(
            '|=================================================================| \n',
            'La solicitud ha sido rechazada. El cliente cuenta con una solicitud en proceso',
            '\n|=================================================================|'
          );
        }
        return approvalMsg(userData);
      }

      return console.log(
        '|=================================================================| \n',
        `La solicitud ha sido rechazada. No cuenta con historial crediticio el importe máximo debe ser ${
          maxAmountWithoutCreditHistory[userData.earnings]
        }`,
        '\n|=================================================================|'
      );
    }
  });

export const PaymentMethods = () => [
  {
    id: 'bank_card',
    name: 'Банковская карта',
    icon: `${global.BASE_URL}/images/bank_card.jpg`,
  },
  {
    id: 'yoo_money',
    name: 'ЮMoney',
    icon: `${global.BASE_URL}/images/ymaney.svg`,
  },
  {
    id: 'sberbank',
    name: 'Сбербанк Онлайн',
    icon: `${global.BASE_URL}/images/sberpay.svg`,
  },
  {
    id: 'sbp',
    name: 'Система быстрых платежей',
    icon: `${global.BASE_URL}/images/sbp.svg`,
  },
  {
    id: 'mobile_balance',
    name: 'Баланс телефона',
    icon: `${global.BASE_URL}/images/mobile_balance.jpg`,
  },
  {
    id: 'cash',
    name: 'Наличные',
    icon: `${global.BASE_URL}/images/cash.jpg`,
  },
  {
    id: 'installments',
    name: 'Покупка в кредит',
    icon: `${global.BASE_URL}/images/installments.jpg`,
  },
];
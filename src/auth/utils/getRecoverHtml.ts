export const getRecoverHTML = (href: string, nickname: string): string => `
  <div style="background-color: #241B24; padding: 15px;">
    <h4 style="color: #fff;">Восстановление пароля</h4>
    <p style="color: #fff;">
      Привет, ${nickname}! Перейдите по ссылке для восстановления пароля, она будет действовать следующие 10 минут.
    </p>
    <p style="color: #fff;">
      Если это не вы, то проигнорируйте это письмо, также рекомендуется сменить свой пароль через: "Настройки" -> "Безопасность" -> "Смена пароля".
    </p>
    <div style="border: 1px solid #5c445c; border-radius: 5px; padding: 10px;">
      <a style="color: #33d17a;" href="${href}">${href}</a>
    </div>
  </div>
`;

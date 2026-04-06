"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    get transporter() {
        if (!this._transporter) {
            const smtpPort = parseInt(process.env.SMTP_PORT || '587');
            this._transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }
        return this._transporter;
    }
    constructor() {
        this._transporter = null;
    }
    async sendCollaboratorInvitation(data) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const acceptUrl = `${frontendUrl}/invitations/${data.collaboratorId}/accept`;
        const declineUrl = `${frontendUrl}/invitations/${data.collaboratorId}/decline`;
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Приглашение к совместному редактированию</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .accept-btn { background-color: #28a745; color: white; }
          .decline-btn { background-color: #dc3545; color: white; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Приглашение к совместному редактированию</h1>
          </div>
          
          <div class="content">
            <p>Здравствуйте, ${data.invitedUserName}!</p>
            
            <p><strong>${data.inviterName}</strong> приглашает вас стать соавтором памятной страницы <strong>"${data.memorialPageName}"</strong>.</p>
            
            <p>Как соавтор, вы сможете:</p>
            <ul>
              <li>Редактировать биографию и основную информацию</li>
              <li>Добавлять фотографии и видео в галереи</li>
              <li>Создавать и редактировать воспоминания</li>
              <li>Управлять информацией о месте захоронения</li>
            </ul>
            
            <p>Чтобы принять или отклонить приглашение, нажмите на одну из кнопок ниже:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" class="button accept-btn">Принять приглашение</a>
              <a href="${declineUrl}" class="button decline-btn">Отклонить</a>
            </div>
            
            <p>Если кнопки не работают, вы можете скопировать и вставить следующие ссылки в браузер:</p>
            <p>Принять: ${acceptUrl}</p>
            <p>Отклонить: ${declineUrl}</p>
          </div>
          
          <div class="footer">
            <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
            <p>Если у вас есть вопросы, обратитесь в службу поддержки.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const textContent = `
      Приглашение к совместному редактированию
      
      Здравствуйте, ${data.invitedUserName}!
      
      ${data.inviterName} приглашает вас стать соавтором памятной страницы "${data.memorialPageName}".
      
      Как соавтор, вы сможете:
      - Редактировать биографию и основную информацию
      - Добавлять фотографии и видео в галереи
      - Создавать и редактировать воспоминания
      - Управлять информацией о месте захоронения
      
      Чтобы принять приглашение, перейдите по ссылке: ${acceptUrl}
      Чтобы отклонить приглашение, перейдите по ссылке: ${declineUrl}
      
      Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
    `;
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: data.invitedUserEmail,
            subject: `Приглашение к редактированию памятной страницы "${data.memorialPageName}"`,
            text: textContent,
            html: htmlContent,
        });
    }
    async sendCollaboratorAcceptedNotification(data) {
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Приглашение принято</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d4edda; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Приглашение принято</h1>
          </div>
          
          <div class="content">
            <p>Здравствуйте, ${data.ownerName}!</p>
            
            <p><strong>${data.collaboratorName}</strong> принял(а) ваше приглашение стать соавтором памятной страницы <strong>"${data.memorialPageName}"</strong>.</p>
            
            <p>Теперь ${data.collaboratorName} может редактировать содержимое страницы и добавлять новые материалы.</p>
            
            <p>Вы можете управлять правами соавторов в разделе "Соавторы" на странице редактирования.</p>
          </div>
          
          <div class="footer">
            <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const textContent = `
      Приглашение принято
      
      Здравствуйте, ${data.ownerName}!
      
      ${data.collaboratorName} принял(а) ваше приглашение стать соавтором памятной страницы "${data.memorialPageName}".
      
      Теперь ${data.collaboratorName} может редактировать содержимое страницы и добавлять новые материалы.
      
      Вы можете управлять правами соавторов в разделе "Соавторы" на странице редактирования.
      
      Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
    `;
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: data.ownerEmail,
            subject: `${data.collaboratorName} принял(а) приглашение к редактированию "${data.memorialPageName}"`,
            text: textContent,
            html: htmlContent,
        });
    }
    async sendCollaboratorDeclinedNotification(data) {
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Приглашение отклонено</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8d7da; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Приглашение отклонено</h1>
          </div>
          
          <div class="content">
            <p>Здравствуйте, ${data.ownerName}!</p>
            
            <p><strong>${data.collaboratorName}</strong> отклонил(а) ваше приглашение стать соавтором памятной страницы <strong>"${data.memorialPageName}"</strong>.</p>
            
            <p>Вы можете пригласить других пользователей в качестве соавторов в любое время.</p>
          </div>
          
          <div class="footer">
            <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const textContent = `
      Приглашение отклонено
      
      Здравствуйте, ${data.ownerName}!
      
      ${data.collaboratorName} отклонил(а) ваше приглашение стать соавтором памятной страницы "${data.memorialPageName}".
      
      Вы можете пригласить других пользователей в качестве соавторов в любое время.
      
      Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
    `;
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: data.ownerEmail,
            subject: `${data.collaboratorName} отклонил(а) приглашение к редактированию "${data.memorialPageName}"`,
            text: textContent,
            html: htmlContent,
        });
    }
    async sendPageChangeNotification(data) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const pageUrl = `${frontendUrl}/memorial/${data.memorialPageSlug}`;
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Изменения в памятной странице</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #e3f2fd; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .change-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 24px; margin: 10px 0; text-decoration: none; border-radius: 5px; font-weight: bold; background-color: #007bff; color: white; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Изменения в памятной странице</h1>
          </div>
          
          <div class="content">
            <p>Здравствуйте, ${data.recipientName}!</p>
            
            <p><strong>${data.changerName}</strong> внес(ла) изменения в памятную страницу <strong>"${data.memorialPageName}"</strong>.</p>
            
            <div class="change-info">
              <p><strong>Тип изменения:</strong> ${data.changeType}</p>
              <p><strong>Описание:</strong> ${data.changeDescription}</p>
            </div>
            
            <p>Вы можете просмотреть изменения, перейдя на страницу:</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${pageUrl}" class="button">Просмотреть страницу</a>
            </div>
            
            <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер: ${pageUrl}</p>
          </div>
          
          <div class="footer">
            <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
            <p>Если вы не хотите получать уведомления об изменениях, обратитесь к владельцу страницы.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const textContent = `
      Изменения в памятной странице
      
      Здравствуйте, ${data.recipientName}!
      
      ${data.changerName} внес(ла) изменения в памятную страницу "${data.memorialPageName}".
      
      Тип изменения: ${data.changeType}
      Описание: ${data.changeDescription}
      
      Вы можете просмотреть изменения по ссылке: ${pageUrl}
      
      Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
    `;
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: data.recipientEmail,
            subject: `Изменения в памятной странице "${data.memorialPageName}"`,
            text: textContent,
            html: htmlContent,
        });
    }
    async sendEmailVerification(data) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationUrl = `${frontendUrl}/auth/verify-email?token=${data.verificationToken}`;
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Подтверждение email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #e3f2fd; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; margin: 20px 0; text-decoration: none; border-radius: 5px; font-weight: bold; background-color: #007bff; color: white; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Подтверждение email</h1>
          </div>
          
          <div class="content">
            <p>Здравствуйте, ${data.name}!</p>
            
            <p>Спасибо за регистрацию! Пожалуйста, подтвердите ваш email адрес, нажав на кнопку ниже:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Подтвердить email</a>
            </div>
            
            <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
            <p>${verificationUrl}</p>
            
            <p>Ссылка действительна в течение 24 часов.</p>
            
            <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
          </div>
          
          <div class="footer">
            <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const textContent = `
      Подтверждение email
      
      Здравствуйте, ${data.name}!
      
      Спасибо за регистрацию! Пожалуйста, подтвердите ваш email адрес, перейдя по ссылке:
      
      ${verificationUrl}
      
      Ссылка действительна в течение 24 часов.
      
      Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
      
      Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
    `;
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: data.email,
            subject: 'Подтверждение email адреса',
            text: textContent,
            html: htmlContent,
        });
    }
    async sendPasswordReset(data) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/auth/reset-password?token=${data.resetToken}`;
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Восстановление пароля</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #fff3cd; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; margin: 20px 0; text-decoration: none; border-radius: 5px; font-weight: bold; background-color: #ffc107; color: #000; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .warning { background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Восстановление пароля</h1>
          </div>
          
          <div class="content">
            <p>Здравствуйте, ${data.name}!</p>
            
            <p>Мы получили запрос на восстановление пароля для вашего аккаунта.</p>
            
            <p>Чтобы создать новый пароль, нажмите на кнопку ниже:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Восстановить пароль</a>
            </div>
            
            <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
            <p>${resetUrl}</p>
            
            <p>Ссылка действительна в течение 1 часа.</p>
            
            <div class="warning">
              <p><strong>⚠️ Важно:</strong> Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо. Ваш пароль останется без изменений.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const textContent = `
      Восстановление пароля
      
      Здравствуйте, ${data.name}!
      
      Мы получили запрос на восстановление пароля для вашего аккаунта.
      
      Чтобы создать новый пароль, перейдите по ссылке:
      
      ${resetUrl}
      
      Ссылка действительна в течение 1 часа.
      
      ⚠️ Важно: Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо. Ваш пароль останется без изменений.
      
      Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
    `;
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: data.email,
            subject: 'Восстановление пароля',
            text: textContent,
            html: htmlContent,
        });
    }
    async testConnection() {
        try {
            await this.transporter.verify();
            return true;
        }
        catch (error) {
            console.error('Email configuration test failed:', error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map
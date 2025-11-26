import { MailTemplate } from 'src/modules/common/infrastructure/utils/mail-templates.util';
import { SubscriptionRegister } from '../../domain/entities/subsciption-register.entity';

export class SubscriptionMailUtil extends MailTemplate {
  constructor(subscriptionRegister: SubscriptionRegister) {
    const user = subscriptionRegister.registration.user;
    const topic = subscriptionRegister.topic;

    const title = '¡Suscripción exitosa al tema de interés!';

    const bodyContent = `
    
    <span style="font-size: 14px;">
      Hola, <b>${MailTemplate.firstLetterCapitalize(user.firstName)} ${MailTemplate.firstLetterCapitalize(user.lastName || '')}</b> 👋 te confirmamos tu suscripción exitosa</b> al tema de interés. A continuación relacionamos el detalle: <br/></span>
    
    ${SubscriptionMailUtil.renderTopicTemplate(topic)}</br>
    `;

    super(title, bodyContent);
  }

  private static renderTopicTemplate(topic: string): string {
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F4F4F4; border-radius: 8px; margin: 20px auto;">
        <tr>
          <td style="padding: 30px 30px 20px 30px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td valign="top">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="font-size: 20px; font-weight: bold; line-height: 1.4; padding-bottom: 8px;">
                        Tema de Interés
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px; line-height: 1.5; padding-top: 10px;">
                        <span>${MailTemplate.firstLetterCapitalize(topic)}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }
}

export class SubscriptionCancellationMailUtil extends MailTemplate {
  constructor(subscriptionRegister: SubscriptionRegister) {
    const user = subscriptionRegister.registration.user;
    const topic = subscriptionRegister.topic;

    const title = 'Cancelación de suscripción al tema de interés';

    const bodyContent = `
    
    <span style="font-size: 14px;">
      Hola, <b>${MailTemplate.firstLetterCapitalize(user.firstName)} ${MailTemplate.firstLetterCapitalize(user.lastName || '')}</b> 👋 te confirmamos la cancelación de tu suscripción</b> al tema de interés. A continuación relacionamos el detalle: <br/></span>
    
    ${SubscriptionCancellationMailUtil.renderTopicTemplate(topic)}</br>
    `;

    super(title, bodyContent);
  }

  private static renderTopicTemplate(topic: string): string {
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F4F4F4; border-radius: 8px; margin: 20px auto;">
        <tr>
          <td style="padding: 30px 30px 20px 30px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td valign="top">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="font-size: 20px; font-weight: bold; line-height: 1.4; padding-bottom: 8px;">
                        Tema de Interés
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px; line-height: 1.5; padding-top: 10px;">
                        <span>${MailTemplate.firstLetterCapitalize(topic)}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }
}

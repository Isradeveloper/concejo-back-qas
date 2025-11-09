import { MailTemplate } from 'src/modules/common/infrastructure/utils/mail-templates.util';
import { ProposalRegisterDetail } from '../../domain/entities';
import { BadRequestException } from '@nestjs/common';
import { formatLongDate } from 'src/modules/common/infrastructure/utils/dates.util';
import { RegistrationCite } from '../../domain/entities/registration-cite.entity';
import { envVars } from 'src/config';

export class ProposalMailUtil extends MailTemplate {
  constructor(proposalRegister: ProposalRegisterDetail) {
    if (!proposalRegister.registration || !proposalRegister.registration.user) {
      throw new BadRequestException('User is required for proposal mail');
    }

    const user = proposalRegister.registration.user;
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';

    const title = '¡Propuesta ciudadana creada exitosamente!';

    const bodyContent = `
      <span style="font-size: 14px;">
        Hola, <b>${MailTemplate.firstLetterCapitalize(firstName)} ${MailTemplate.firstLetterCapitalize(lastName)}</b> 👋 te confirmamos que tu propuesta ciudadana ha sido creada exitosamente. A continuación relacionamos el detalle: <br/><br/>
      </span>

      ${ProposalMailUtil.renderProposalTemplate(proposalRegister)}

      ${
        proposalRegister.registrationCites && proposalRegister.registrationCites.length > 0
          ? `
      <br/><br/>
      <span style="font-size: 14px;">
        <b>Citaciones realizadas:</b><br/>
        Se han enviado notificaciones a los siguientes usuarios citados para que respondan las preguntas asociadas a esta propuesta.
      </span>
      ${ProposalMailUtil.renderCitesTemplate(proposalRegister.registrationCites)}
      `
          : ''
      }
    `;

    super(title, bodyContent);
  }

  private static renderProposalTemplate(proposalRegister: ProposalRegisterDetail): string {
    const simiEventCode = proposalRegister.simiEventCode || '';
    const politicalTopic = proposalRegister.politicalTopic || '';
    const politicalTopicJustification = proposalRegister.politicalTopicJustification || '';
    const statusName = proposalRegister.proposalStatus?.name || '';

    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F4F4F4; border-radius: 8px; margin: 20px auto;">
        <tr>
          <td style="padding: 30px 30px 20px 30px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td valign="top">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    ${
                      simiEventCode
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px;">
                        Código SIMI:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.uppercase(simiEventCode)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    ${
                      statusName
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px;">
                        Estado:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.firstLetterCapitalize(statusName)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    ${
                      politicalTopic
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px; vertical-align: top;">
                        Tema político:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.firstLetterCapitalize(politicalTopic)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    ${
                      politicalTopicJustification
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px; vertical-align: top;">
                        Justificación:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.firstLetterCapitalize(politicalTopicJustification)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px;">
                        Fecha de creación:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${formatLongDate(proposalRegister.createdAt)}
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

  private static renderCitesTemplate(cites: RegistrationCite[]): string {
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F4F4F4; border-radius: 8px; margin: 20px auto;">
        ${cites
          .map(
            (cite, citeIndex) => `
        <tr>
          <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${citeIndex > 0 ? 'border-top: 1px solid #e0e0e0;' : ''}">
              <tr>
                <td style="padding: 20px 30px 15px 30px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="font-size: 16px; font-weight: bold; padding-bottom: 15px;">
                        ${cite.user ? `${MailTemplate.firstLetterCapitalize(cite.user.firstName || '')} ${MailTemplate.firstLetterCapitalize(cite.user.lastName || '')}` : 'Usuario citado'}
                        ${cite.user?.dependency ? ` - ${MailTemplate.firstLetterCapitalize(cite.user.dependency.name || '')}` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${
                cite.citeQuestions && cite.citeQuestions.length > 0
                  ? `
              <tr>
                <td>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #e0e0e0;">
                    <tr>
                      <td style="padding: 15px 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="font-size: 13px; font-weight: bold; padding-bottom: 10px;">
                              Preguntas:
                            </td>
                          </tr>
                          ${cite.citeQuestions
                            .map(
                              (question, questionIndex) => `
                          <tr>
                            <td style="font-size: 13px; ${questionIndex < cite.citeQuestions.length - 1 ? 'padding-bottom: 8px;' : ''}">
                              ${questionIndex + 1}. ${MailTemplate.firstLetterCapitalize(question.question)}
                            </td>
                          </tr>
                          `,
                            )
                            .join('')}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              `
                  : ''
              }
            </table>
          </td>
        </tr>
        `,
          )
          .join('')}
      </table>
    `;
  }
}

export class ProposalCiteMailUtil extends MailTemplate {
  constructor(proposalRegister: ProposalRegisterDetail, registrationCite: RegistrationCite) {
    if (!registrationCite.user) {
      throw new BadRequestException('Cited user is required for proposal cite mail');
    }

    const citedUser = registrationCite.user;
    const firstName = citedUser.firstName || '';
    const lastName = citedUser.lastName || '';

    const title = `Has sido citado en una propuesta ciudadana Nº ${proposalRegister.id}`;

    const bodyContent = `
      <span style="font-size: 14px;">
        Hola, <b>${MailTemplate.firstLetterCapitalize(firstName)} ${MailTemplate.firstLetterCapitalize(lastName)}</b> 👋 te informamos que has sido citado en una propuesta ciudadana. A continuación relacionamos el detalle: <br/><br/>
      </span>

      ${ProposalCiteMailUtil.renderProposalTemplate(proposalRegister)}

      ${
        registrationCite.citeQuestions && registrationCite.citeQuestions.length > 0
          ? `
      <br/><br/>
      <span style="font-size: 14px;">
        <b>Preguntas para ti:</b><br/>
        Por favor, responde las siguientes preguntas relacionadas con esta propuesta:
      </span>
      ${ProposalCiteMailUtil.renderQuestionsTemplate(registrationCite.citeQuestions)}
      `
          : ''
      }
      <br/><br/>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${envVars.APP_URL}admin/proposals-by-citations/${proposalRegister.id}/detail" class="button">
          Ver detalle de la citación
        </a>
      </div>
    `;

    super(title, bodyContent);
  }

  private static renderProposalTemplate(proposalRegister: ProposalRegisterDetail): string {
    const creatorUser = proposalRegister.registration?.user;
    const creatorFirstName = creatorUser?.firstName || '';
    const creatorLastName = creatorUser?.lastName || '';
    const simiEventCode = proposalRegister.simiEventCode || '';
    const politicalTopic = proposalRegister.politicalTopic || '';
    const politicalTopicJustification = proposalRegister.politicalTopicJustification || '';
    const statusName = proposalRegister.proposalStatus?.name || '';

    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F4F4F4; border-radius: 8px; margin: 20px auto;">
        <tr>
          <td style="padding: 30px 30px 20px 30px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td valign="top">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    ${
                      creatorUser
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px;">
                        Propuesta creada por:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.firstLetterCapitalize(creatorFirstName)} ${MailTemplate.firstLetterCapitalize(creatorLastName)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    ${
                      simiEventCode
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px;">
                        Código SIMI:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.uppercase(simiEventCode)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    ${
                      statusName
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px;">
                        Estado:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.firstLetterCapitalize(statusName)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    ${
                      politicalTopic
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px; vertical-align: top;">
                        Tema político:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.firstLetterCapitalize(politicalTopic)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    ${
                      politicalTopicJustification
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px; vertical-align: top;">
                        Justificación:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.firstLetterCapitalize(politicalTopicJustification)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px;">
                        Fecha de creación:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${formatLongDate(proposalRegister.createdAt)}
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

  private static renderQuestionsTemplate(questions: { question: string }[]): string {
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F4F4F4; border-radius: 8px; margin: 20px auto;">
        <tr>
          <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 20px 30px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    ${questions
                      .map(
                        (question, index) => `
                    <tr>
                      <td style="font-size: 13px; ${index < questions.length - 1 ? 'padding-bottom: 12px;' : ''}">
                        <b>${index + 1}.</b> ${MailTemplate.firstLetterCapitalize(question.question)}
                      </td>
                    </tr>
                    `,
                      )
                      .join('')}
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

export class ProposalAnswerMailUtil extends MailTemplate {
  constructor(data: {
    proposalId: number;
    simiEventCode: string | null;
    politicalTopic: string | null;
    creatorFirstName: string;
    creatorLastName: string | null;
    citedUserFirstName: string;
    citedUserLastName: string | null;
    citedUserDependency: string | null;
    question: string;
    answer: string;
  }) {
    const title = `Respuesta recibida en la propuesta ciudadana Nº ${data.proposalId}`;

    const bodyContent = `
      <span style="font-size: 14px;">
        Hola, <b>${MailTemplate.firstLetterCapitalize(data.creatorFirstName)} ${MailTemplate.firstLetterCapitalize(data.creatorLastName || '')}</b> 👋 te informamos que has recibido una respuesta a una pregunta de tu propuesta ciudadana. <br/><br/>
      </span>

      ${ProposalAnswerMailUtil.renderProposalInfo(data)}

      <br/><br/>
      <span style="font-size: 14px;">
        <b>Respuesta recibida:</b><br/>
      </span>
      ${ProposalAnswerMailUtil.renderAnswerTemplate(data)}
    `;

    super(title, bodyContent);
  }

  private static renderProposalInfo(data: {
    proposalId: number;
    simiEventCode: string | null;
    politicalTopic: string | null;
    citedUserFirstName: string;
    citedUserLastName: string | null;
    citedUserDependency: string | null;
  }): string {
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F4F4F4; border-radius: 8px; margin: 20px auto;">
        <tr>
          <td style="padding: 30px 30px 20px 30px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td valign="top">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px;">
                        Respuesta de:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.firstLetterCapitalize(data.citedUserFirstName)} ${MailTemplate.firstLetterCapitalize(data.citedUserLastName || '')}${data.citedUserDependency ? ` - ${MailTemplate.firstLetterCapitalize(data.citedUserDependency)}` : ''}
                      </td>
                    </tr>
                    ${
                      data.simiEventCode
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px;">
                        Código SIMI:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.uppercase(data.simiEventCode)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    ${
                      data.politicalTopic
                        ? `
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; padding-bottom: 8px; vertical-align: top;">
                        Tema político:
                      </td>
                      <td style="font-size: 14px; padding-bottom: 8px;">
                        ${MailTemplate.firstLetterCapitalize(data.politicalTopic)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  private static renderAnswerTemplate(data: { question: string; answer: string }): string {
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F4F4F4; border-radius: 8px; margin: 20px auto;">
        <tr>
          <td style="padding: 20px 30px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="font-size: 13px; font-weight: bold; padding-bottom: 10px;">
                  Pregunta:
                </td>
              </tr>
              <tr>
                <td style="font-size: 13px; padding-bottom: 15px;">
                  ${MailTemplate.firstLetterCapitalize(data.question)}
                </td>
              </tr>
              <tr>
                <td style="font-size: 13px; font-weight: bold; padding-bottom: 10px;">
                  Respuesta:
                </td>
              </tr>
              <tr>
                <td style="font-size: 13px;">
                  ${MailTemplate.firstLetterCapitalize(data.answer)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }
}

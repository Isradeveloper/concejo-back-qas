import { MailTemplate } from 'src/modules/common/infrastructure/utils/mail-templates.util';
import { ParticipationRegister } from '../../domain/entities';
import { BadRequestException } from '@nestjs/common';
import { formatLongDate } from 'src/modules/common/infrastructure/utils/dates.util';
import { typesInSpanish } from '../../domain/constants/register-types.constants';

export interface Member {
  name: string;
  faction: string;
}

export interface Speaker {
  name: string;
}

export interface MeetingData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  specializedProfessional?: string;
  coordinatingCouncilor?: string;
  speakers?: Speaker[];
  members?: Member[];
}

export class ParticipationMailUtil extends MailTemplate {
  constructor(participationRegister: ParticipationRegister) {
    const user = participationRegister.registration.user;
    const event = participationRegister.registration.event;

    if (!event) {
      throw new BadRequestException('Event is required for participation mail');
    }

    const title = '¡Gracias por tu participación al mecanismo de participación ciudadana!';

    const bodyContent = `
    
    <span style="font-size: 14px;">
      Hola, <b>${MailTemplate.firstLetterCapitalize(user.firstName)} ${MailTemplate.firstLetterCapitalize(user.lastName || '')}</b> 👋 te confirmamos la inscripción exitosa</b> al mecanismo de participación ciudadana${participationRegister.organizationName ? `, en representación de ${MailTemplate.firstLetterCapitalize(participationRegister.organizationName)}` : ''}, a continuación relacionamos el detalle de dicho evento: <br/></span>
    
    ${ParticipationMailUtil.renderMeetingTemplate({
      title: `${typesInSpanish[event.type]} ${event.simiEventCode}`,
      description: event.description,
      date: formatLongDate(event.date),
      time: event.hour,
      location: event.place,
      specializedProfessional: event.specializedProfessional,
      coordinatingCouncilor: event.coordinator,
      speakers: event.speakers.map((speaker) => ({ name: speaker })),
      members: event.members?.map((member) => ({ name: member.name, faction: member.bench })),
    })}</br>
    `;

    super(title, bodyContent);
  }

  private static renderMeetingTemplate(data: MeetingData): string {
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
                        ${MailTemplate.firstLetterCapitalize(data.title)}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; line-height: 1.5;">
                        <span>${MailTemplate.firstLetterCapitalize(data.description)}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <tr>
          <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #e0e0e0;">
              <tr>
                <td style="padding: 20px 30px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td width="55%" valign="middle" style="padding-right: 15px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td width="20" valign="middle" style="padding-right: 8px; font-weight: bold;">
                              📅
                            </td>
                            <td valign="middle" style="font-size: 13px; line-height: 1.5;">
                              <b>${MailTemplate.firstLetterCapitalize(data.date)}</b>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td width="15%" valign="middle" style="padding-right: 15px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td width="20" valign="middle" style="padding-right: 8px; font-weight: bold;">
                              🕒
                            </td>
                            <td valign="middle" style="font-size: 13px; line-height: 1.5;">
                              <b>${MailTemplate.uppercase(data.time)}</b>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td width="30%" valign="middle">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td width="20" valign="middle" style="padding-right: 8px; font-weight: bold;">
                              📍
                            </td>
                            <td valign="middle" style="font-size: 13px; line-height: 1.5;">
                              <b>${MailTemplate.firstLetterCapitalize(data.location)}</b>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${
          data.specializedProfessional || data.coordinatingCouncilor
            ? `
        <tr>
          <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #e0e0e0;">
              <tr>
                <td style="padding: 20px 30px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    ${
                      data.specializedProfessional
                        ? `
                    <tr>
                      <td width="200" style="font-size: 13px; font-weight: bold; padding-bottom: 10px;">
                        Profesional especializado:
                      </td>
                      <td style="font-size: 13px; padding-bottom: 10px;">
                        ${MailTemplate.uppercase(data.specializedProfessional)}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                    ${
                      data.coordinatingCouncilor
                        ? `
                    <tr>
                      <td width="200" style="font-size: 13px; font-weight: bold; padding-bottom: 10px;">
                        Concejal Coordinador:
                      </td>
                      <td style="font-size: 13px; padding-bottom: 10px;">
                        ${MailTemplate.uppercase(data.coordinatingCouncilor)}
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
        `
            : ''
        }

        ${
          data.speakers && data.speakers.length > 0
            ? (() => {
                const speakers = data.speakers;
                return `
        <tr>
          <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #e0e0e0;">
              <tr>
                <td style="padding: 20px 30px 15px 30px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="font-size: 16px; font-weight: bold; padding-bottom: 15px; text-align: center; vertical-align: middle;">
                        Ponentes
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #e0e0e0;">
                    <tr>
                      <td style="padding: 15px 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="font-size: 13px; font-weight: bold; padding-bottom: 10px;">
                              Nombre
                            </td>
                          </tr>
                          ${speakers
                            .map(
                              (speaker, index) => `
                          <tr>
                            <td style="font-size: 13px; ${index < speakers.length - 1 ? 'padding-bottom: 8px;' : ''}">
                              ${MailTemplate.uppercase(speaker.name)}
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
          </td>
        </tr>
        `;
              })()
            : ''
        }

        ${
          data.members && data.members.length > 0
            ? (() => {
                const members = data.members;
                return `
        <tr>
          <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #e0e0e0;">
              <tr>
                <td style="padding: 20px 30px 15px 30px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="font-size: 16px; font-weight: bold; padding-bottom: 15px; text-align: center; vertical-align: middle;">
                        Integrantes
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #e0e0e0;">
                    <tr>
                      <td style="padding: 15px 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td width="50%" style="font-size: 13px; font-weight: bold; padding-bottom: 10px;">
                              Concejales
                            </td>
                            <td width="50%" style="font-size: 13px; font-weight: bold; padding-bottom: 10px;">
                              Bancadas
                            </td>
                          </tr>
                          ${members
                            .map(
                              (member, index) => `
                          <tr>
                            <td width="50%" style="font-size: 13px; ${
                              index < members.length - 1 ? 'padding-bottom: 8px;' : ''
                            }">
                              ${MailTemplate.uppercase(member.name)}
                            </td>
                            <td width="50%" style="font-size: 13px; ${
                              index < members.length - 1 ? 'padding-bottom: 8px;' : ''
                            }">
                              ${MailTemplate.uppercase(member.faction)}
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
          </td>
        </tr>
        `;
              })()
            : ''
        }

      </table>
    `;
  }
}

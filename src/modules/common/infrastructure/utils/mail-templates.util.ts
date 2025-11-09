export class MailTemplate {
  constructor(
    private readonly title: string,
    private readonly bodyContent: string,
  ) {}

  public render(): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${this.title}</title>
        <style>

          * {
            font-family: tahoma;
            color:  #062033;
          }

          body {
            font-family: tahoma;
            background-color: #f7f9fc;
            margin: 0;
            padding: 0;
            color:  #062033;
          }

          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            overflow: hidden;
          }

          .header {
            text-align: center;
            font-size: 1.5rem;
            font-weight: 600;
            padding: 20px;
            color: #062033;
          }

          .content {
            font-family: tahoma;
            padding: 30px 20px;
            line-height: 1.6;
          }

          .footer {
            text-align: center;
            padding: 15px;
            font-size: 0.9rem;
            color: #777;
            background: #f0f0f0;
          }

          a.button {
            display: inline-block;
            background-color: #062033;
            color: white !important;
            padding: 10px 18px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 15px;
          }

          .logo {
            text-align: center;
            background-image: url('https://www.concejodemedellin.gov.co/wp-content/uploads/2023/07/CONCEJO-horizontal.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            width: 100%;
            height: 100px;
          }

          .uppercase {
            text-transform: uppercase;
          }

          .capitalize-first {
            text-transform: lowercase !important;
          }

          .capitalize-first::first-letter {
            text-transform: uppercase !important;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo"></div>
          <div class="header">${this.title}</div>
          <div class="content">
            ${this.bodyContent}
            <br>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public static firstLetterCapitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  public static uppercase(text: string): string {
    return text.toUpperCase();
  }
}

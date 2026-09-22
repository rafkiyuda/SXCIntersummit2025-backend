// emailTemplates.js

// Konstanta Styling Global
const globalStyles = `
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333333;
`;

const mainContainerStyles = `
  background-color: #ffffff;
  padding: 30px 30px 30px 30px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

// Footer konstan sesuai referensi
function footerHTML() {
  return `
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0 30px 0; background-color: #8257A9; color: #ffffff; padding: 20px 0;">
              &copy; 2025 StudentsxCEOs InterSummit. All rights reserved.<br/>
              Follow us on <a href="https://www.instagram.com/sxcintersummit/" style="color: #ffffff; text-decoration: none;">Instagram</a>
            </td>
          </tr>
        </table>
  `;
}

function createHeader(title) {
  return `
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 40px 0 30px 0; background-color: #8257A9; color: #ffffff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${title}</h1>
        </td>
      </tr>
    </table>
  `;
}

function createBody(contentBlocks) {
  return `
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
      <tr>
        <td bgcolor="#ffffff" style="${mainContainerStyles}">
          ${contentBlocks
            .map((block) => {
              switch (block.type) {
                case "title":
                  return `<h2 style="color: #007bff; font-size: 20px; border-bottom: 2px solid #eeeeee; padding-bottom: 5px; margin: 30px 0 15px 0;">${block.text}</h2>`;
                case "paragraph":
                  return `<p style="margin: 0 0 15px 0; font-size: 15px; color: #000000;">${block.text}</p>`;
                case "normal_paragraph":
                  // Teks biasa tanpa margin khusus
                  return `<p style="margin: 0 0 15px 0;">${block.text}</p>`;
                case "list":
                  return `
                    <ul style="margin: 0 0 15px 20px; padding: 0; font-size: 15px; color: #000000;">
                      ${block.items.map((item) => `<li>${item}</li>`).join("")}
                    </ul>
                  `;
                case "otp":
                  return `<p style="font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; color: #000000;">${block.text}</p>`;
                case "image":
                  return `<div style="text-align: center; margin: 20px 0;"><img src="${
                    block.src
                  }" alt="${
                    block.alt || "Image"
                  }" style="max-width: 100%; height: auto;" /></div>`;
                default:
                  return block.text; // plain html/text
              }
            })
            .join("")}
        </td>
      </tr>
    </table>
  `;
}

function createTable(columns, rows) {
  const thead = columns
    .map(
      (c) => `
    <th style="padding: 10px; text-align: center; color: #000000;">${c.header}</th>
  `
    )
    .join("");

  const tbody = rows
    .map(
      (row) => `
    <tr>
      ${columns
        .map(
          (c) => `
        <td style="padding: 10px; color: #000000;">${row[c.field] || ""}</td>
      `
        )
        .join("")}
    </tr>
  `
    )
    .join("");

  return `
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
      <tr>
        <td bgcolor="#ffffff" style="background-color: #ffffff;padding: 0px 30px 10px 30px;">
          <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse: collapse; border-color: #dddddd; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">${thead}</tr>
            </thead>
            <tbody>
              ${tbody}
            </tbody>
          </table>
        </td>
      </tr>
    </table>
  `;
}

async function composeEmail({ title, bodyBlocks, tableData, tableColumns }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; ${globalStyles} background-color: #f4f4f4;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 20px 0 30px 0;">
            ${createHeader(title)}
            ${createBody(bodyBlocks)}
            ${
              tableData && tableColumns
                ? createTable(tableColumns, tableData)
                : ""
            }
            ${footerHTML()}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

module.exports = {
  composeEmail,
  createHeader, // Tetap export jika ingin digunakan secara terpisah
  createBody,
  createTable,
  footerHTML,
};

export const createHtmlTemplate = (resetUrl: string, username: string) => `<h3>
    Hi ${username},
  </h3>
  <p>
    You recently requested to reset your password for your TACO account. Use the button below to
    reset it.
  </p>
  <!-- Action -->
  <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <a href="${resetUrl}" class="button button--green" target="_blank"
                      >Reset your password</a
                    >
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <p>If you did not request a password reset, please ignore this email.</p>
  <p>Thanks, <br />The TACO Team</p>
  <!-- Sub copy -->
  <table class="body-sub">
    <tr>
      <td>
        <p class="sub">
          If you’re having trouble with the button above, copy and paste the URL below into your web
          browser.
        </p>
        <p class="sub">${resetUrl}</p>
      </td>
    </tr>
  </table>`

export const createTextTemplate = (resetUrl: string, username: string) => `************
Hi ${username},
************

You recently requested to reset your password for your TACO account. Use the button below to reset it.

Reset your password ( ${resetUrl} )

If you did not request a password reset, please ignore this email.

Thanks,
The TACO Team

If you’re having trouble with the button above, copy and paste the URL below into your web browser.

${resetUrl}`

function SendEmailMailJet(body,email){
     
  var mailjeturl = "https://api.mailjet.com/v3.1/send";
  var apisecret = api_secret;
  var apikey = apikey;

  var encoding = Utilities.base64Encode(apikey + ':' + apisecret);

     
    var payload = {
      "Messages":[{
      "From": {"Email": 'email@gmail.com',"Name": 'house of ideas'},
      "To": [{"Email": email}],
      "Subject": 'your inviation to Rose october event',
      "HTMLPart": body,
    }]}
    var mailjetoptions = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': {"Authorization": "Basic " + encoding},
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true 
     } ;
  
    var response = JSON.parse(UrlFetchApp.fetch(mailjeturl, mailjetoptions))


    if (response.Messages && response.Messages[0].Status === 'success') {
    return { success: true };
  } else {
    return { success: false, error: JSON.stringify(response) };
  }
}


function SendEmailViaGoogle(body, email) {
  try {
    MailApp.sendEmail({
      to: email,
      subject: "subject",
      htmlBody: body
    });
    return { success: true, message: "Email sent successfully to: " + email };
  } catch (err) {
    return { success: false, error: "Error sending email: " + err.message };
  }
}


function SendViaBrevo(email,name,body, qrcodeUrl) {
  const brevoUrl = "https://api.brevo.com/v3/smtp/email";
  const apikey =apikey;

  var qrCodeResponse = UrlFetchApp.fetch(qrcodeUrl);
  var qrCodeBlob = qrCodeResponse.getBlob();
  var qrCodeBase64 = Utilities.base64Encode(qrCodeBlob.getBytes());

  var payload = {  
    "sender": {  
      "name": "House of ideas",
      "email": emil@gmail.com
    },
    "to": [  
      {  
        "email": email,
        "name": name
      }
    ],
    "subject": "Registration QR Code",
    "htmlContent": body,
    "attachment": [
      {
        "content": qrCodeBase64,
        "name": "qrcode.png",
        "type": "image/png"
      }
    ]
  };

  var brevoOptions = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': {"api-key": apikey},
    'payload': JSON.stringify(payload)
  };


 try {
    var qrCodeResponse = UrlFetchApp.fetch(qrcodeUrl);
    var qrCodeBlob = qrCodeResponse.getBlob();
    var qrCodeBase64 = Utilities.base64Encode(qrCodeBlob.getBytes());

    var payload = {
      "sender": {
        "name": "me",
        "email": "email@gmail.com"
      },
      "to": [
        {
          "email": email,
          "name": name
        }
      ],
      "subject": "subject",
      "htmlContent": body,
      "attachment": [
        {
          "content": qrCodeBase64,
          "name": "qrcode.png",
          "type": "image/png"
        }
      ]
    };

    var brevoOptions = {
      'method': 'post',
      'contentType': 'application/json',
      'headers': {"api-key": apikey},
      'payload': JSON.stringify(payload),
      'muteHttpExceptions': true
    };

    var response = UrlFetchApp.fetch(brevoUrl, brevoOptions);
    var responseContent = response.getContentText();
    var responseCode = response.getResponseCode();

    if (responseCode === 200 || responseCode === 201) {
      Logger.log("succes via Brevo to: " + email);
      return { success: true, message: "email sent to: " + email };
    } else {
      Logger.log("failed via Brevo : " + responseContent);
      return { success: false, error: "Failed to send email. Response code: " + responseCode + ", Content: " + responseContent };
    }
  } catch (err) {
    Logger.log("Error in SendViaBrevo: " + err.message);
    return { success: false, error: "Error sending email: " + err.message };
  }
}


function sendwithFallback(email,name, body, qrcodeUrl) {
  const apis = [

    { servicename: 'Brevo', funct: SendViaBrevo, args: [email,name,body,qrcodeUrl] },
    { servicename: 'Google', funct: SendEmailViaGoogle, args: [body, email] },
    { servicename: 'MailJet', funct: SendEmailMailJet, args: [body, email] },


];

  for (let api of apis) {
    try {
      const result = api.funct.apply(null, api.args);
      Logger.log(`Attempt with ${api.servicename}: ${JSON.stringify(result)}`);
      if (result && result.success) {
        Logger.log(`Success with : ${api.servicename}`);
        return true;
      } else {
        Logger.log(`Failed with ${api.servicename}: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      Logger.log(`Error with ${api.servicename}: ${error.toString()}`);
    }
  }

  Logger.log("All email sending attempts failed");
  return false;
}


function onFormSubmit(e) {
  SpreadsheetApp.flush();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];





  var emailIndex = headers.indexOf("Email");
  var nameIndex = headers.indexOf("full name");
  var phoneNumberIndex = headers.indexOf("Phone number");

  
  var lastSubmission = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var email = lastSubmission[emailIndex];
  var name = lastSubmission[nameIndex];
  var phoneNumber = lastSubmission[phoneNumberIndex];

  if (email && name && phoneNumber) {
    var qrcodeUrl = "https://quickchart.io/qr?text=" + encodeURIComponent('name:' + name + '\nphone number:' + phoneNumber) + "&size=300";
    
    
    var body = `<body style="word-spacing:normal; background-color:#F19ED2;">




      
    <style type="text/css">
        @media only screen and (min-width:480px) {
            .mj-column-per-100 {
                width: 100% !important;
                max-width: 100%;
            }
            .mj-column-per-50 {
                width: 50% !important;
                max-width: 50%;
            }
        }
    </style>
    <style media="screen and (min-width:480px)">
        .moz-text-html .mj-column-per-100 {
            width: 100% !important;
            max-width: 100%;
        }

        .moz-text-html .mj-column-per-50 {
            width: 50% !important;
            max-width: 50%;
        }
    </style>
    <style type="text/css">
        @media only screen and (max-width:480px) {
            table.mj-full-width-mobile {
                width: 100% !important;
            }
            td.mj-full-width-mobile {
                width: auto !important;
            }
        }
    </style>
    <div>

        <div style="margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody>
                    <tr>
                        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                        
                            <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                    <tbody>
                                                        <tr>
                                                            <td style="width:80px;"><img height="auto" src="https://i.ibb.co/t2KXTgg/HI-PINK-OCTOBER-cropped-1-m07s2s.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                                                                    width="80"></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
             
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

     

        <div style="margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody>
                    <tr>
                        <td style="direction:ltr;font-size:0px;padding:20px 10px;text-align:center;">
                 
                            <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="font-size:0px;padding:0px;word-break:break-word;">
                                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                    <tbody>
                                                        <tr>
                                                            <td style="width:500px;"><img alt="Breast Cancer Awareness" height="auto" src="https://i.ibb.co/gwVfDtk/october-breast-cancer-awareness.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                                                                    width="500"></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                          
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style="margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody>
                    <tr>
                        <td style="direction:ltr;font-size:0px;padding:10px;text-align:center;">

                            <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                    <tbody>
                                        
                                        
                                        <tr>
                                            <td align="left" style="font-size:0px;padding:10px 25px;padding-top:10px;padding-bottom:5px;word-break:break-word;">
                                                <div style="font-family:Arial, sans-serif;font-size:16px;font-weight:bold;line-height:1;text-align:left;color:#FF4191;">Event Day (23rd October):</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                <div style="font-family:Arial, sans-serif;font-size:14px;line-height:1.3;text-align:left;color:#333333;">• 10AM-12:30PM: Speakers (Doctor & Survivor)<br>• 1PM-3PM: Stands and activities</div>
                                            </td>
                                        </tr>
                                         <tr>
                                            <td align="left" style="font-size:0px;padding:10px 25px;padding-top:10px;padding-bottom:5px;word-break:break-word;">
                                                <div style="font-family:Arial, sans-serif;font-size:16px;font-weight:bold;line-height:1;text-align:left;color:#FF4191;">Speakers</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                <div style="font-family:Arial, sans-serif;font-size:14px;line-height:1.3;text-align:left;color:#333333;">Doctor : Samy zerrouki
                                                    <br>
                                                
                                                    Survivor : Meena inspiration
                                                    </div>
                                            </td>
                                        </tr>
                                          <tr>
                                            <td align="left" style="font-size:0px;padding:10px 25px;padding-top:10px;padding-bottom:5px;word-break:break-word;">
                                                <div style="font-family:Arial, sans-serif;font-size:16px;font-weight:bold;line-height:1;text-align:left;color:#FF4191;">Event Location</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                <div style="font-family:Arial, sans-serif;font-size:14px;line-height:1.3;text-align:left;color:#333333;">amphi S : university of Algiers 3 - dely Ibrahim </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style="margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody>
                    <tr>
                        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
               
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
 
        <div style="margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody>
                    <tr>
                        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                 
                            <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="left" class="text-shadow" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                <div style="font-size:24px;font-weight:700;line-height:1;text-align:left;color:#FF4191;">your entry code :</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                    
                            <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                    <tbody>
                                                        <tr>
                                                         
                                                          <td style="width:250px;">
                                                          <img height="auto"  src="${qrcodeUrl}"  style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="250">
                                                          </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                         
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
      
    </div>
</body>`;


 
      
    if(sendwithFallback(email,name,body,qrcodeUrl)){
      Logger.log('succes sending email');
      sheet.getRange(lastRow, sheet.getLastColumn() ).setValue("email sent")
    }else{
      Logger.log('operation succes')
      sheet.getRange(lastRow, sheet.getLastColumn()).setValue("Error sending email")
    }



  }
}


























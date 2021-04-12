export async function playerWhisper() {
    let optionsString = ''
    game.users.forEach(user => {
        optionsString += `<option value='${user._data.name}'>${user._data.name}</option>`
    });

    new Dialog({
        title: 'Pssst... Leise!',
        content: `
      <form>
        <div class="form-group">
          <label>Empfänger</label>
          <select name='recipient' id='whisperrecipient'>${optionsString}</select>
        </div>
        <div class="form-group">
          <label>geheime Nachricht</label>
          <input type='text' name='message'/>
        </div>
      </form>`,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: `Senden`,
                callback: html => {
                    let message = html.find('input[name=\'message\']');
                    let recipient = html.find('select[name=\'recipient\']');
                    if (message.val() !== '') {
                        ChatMessage.create({
                            user: game.user._id,
                            content: 'Flüstert <i><b>"' + message.val() + '"</b></i>',
                            whisper: ChatMessage.getWhisperRecipients(recipient.val())
                        });
                    }
                }
            }
        },
        default: 'yes',
        render: html => {
            html.find('input[name=\'message\']').focus()
        }
    }).render(true);
}

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const fetch = require('node-fetch');
const sharp = require('sharp');

require('dotenv').config();

const channelId = process.env.CHANNELID ?? '1234567891234567891';

module.exports = {
    data: {
        name: 'msg_bem_vindo'
    },
    async execute(member) {
        // Carregar uma imagem de fundo (background)
        const background = await loadImage('background.jpg'); // Substitua 'background.jpg' pelo caminho da sua imagem de fundo

        // Criar um canvas com as dimensões da imagem de fundo
        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        // Desenhar a imagem de fundo no canvas
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Adicionar a foto do perfil do novo membro
        const imageURL = member.user.displayAvatarURL({ size: 128 });
        const avatarBuffer = await fetch(imageURL).then(response => response.buffer());

        // Converter a imagem para JPEG
        const jpegBuffer = await sharp(avatarBuffer).jpeg().toBuffer();
        const avatar = await loadImage(jpegBuffer);

        // Configurar as dimensões e a posição da foto de perfil
        const avatarSize = 128; // Tamanho desejado
        const avatarX = (canvas.width - avatarSize) / 2; // Centralizar horizontalmente
        const avatarY = 60; // Posição vertical ajustada para 50 pixels

        // Desenhar a borda branca
        const borderWidth = 6;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + borderWidth, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff'; // Cor da borda branca
        ctx.fill();

        // Desenhar a foto do perfil dentro da borda branca (círculo)
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Definir a fonte e o tamanho do texto
        ctx.font = '40px Arial, Sans';
        ctx.fillStyle = '#ffffff'; // Cor do texto

        // Medir o comprimento do texto em ambas as linhas
        const welcomeText = 'Bem-vindo(a),';
        const usernameText = member.user.username;
        const welcomeTextWidth = ctx.measureText(welcomeText).width;
        const usernameTextWidth = ctx.measureText(usernameText).width;

        // Calcular a posição x para centralizar o texto horizontalmente
        const welcomeTextX = (canvas.width - welcomeTextWidth) / 2;
        const usernameTextX = (canvas.width - usernameTextWidth) / 2;;

        // Calcular a posição y para centralizar o texto verticalmente abaixo da foto
        const textSpacing = 45; // Espaço entre o texto e a foto
        const textY = avatarY + avatarSize + textSpacing;

        // Desenhar o texto de boas-vindas no canvas
        ctx.fillText(welcomeText, welcomeTextX, textY);
        ctx.fillText(usernameText, usernameTextX, textY + 45); // Ajustei a posição vertical para 30 pixels abaixo do texto de boas-vindas

        // Adicionar o número total de usuários no servidor
        const totalMembersText = "Você é o " + member.guild.memberCount + "º Membro!";
        const totalMembersTextHeight = 20; // Altura estimada do texto
        const totalMembersTextY = textY + 45 + totalMembersTextHeight + 10; // 30 pixels abaixo do texto de usuário + 10 pixels de espaçamento

        // Modificar o tamanho da fonte para metade
        ctx.font = '20px Arial, Sans';

        // Calcular a posição x para centralizar o texto horizontalmente
        const totalMembersTextWidth = ctx.measureText(totalMembersText).width;
        const totalMembersTextX = (canvas.width - totalMembersTextWidth) / 2;

        // Calcular a posição y para centralizar o texto verticalmente abaixo do texto de usuário
        ctx.fillText(totalMembersText, totalMembersTextX, totalMembersTextY);

        // Salvar o canvas como uma imagem
        const attachment = canvas.toBuffer('image/jpeg');
        fs.writeFileSync('boas_vindas.jpg', attachment);

        // Enviar a imagem ao canal de boas-vindas
        const channel = member.guild.channels.cache.get(channelId);
        if (channel) {
            channel.send({
                content: `Olá <@${member.user.id}>. seja bem-vindo ao __**${member.guild.name}**__`,
                files: [attachment]
            });
        }

        console.info('Novo usuario: ', member.user.username);
    }
}
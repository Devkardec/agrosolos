# Instruções para Criar Ícones do PWA

Para que o PWA funcione completamente, você precisa criar dois ícones:

## Tamanhos Necessários
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

## Como Criar

### Opção 1: Usar Gerador Online
1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload de uma imagem (recomendado: 512x512px ou maior)
3. Baixe os ícones gerados
4. Coloque os arquivos na raiz do projeto

### Opção 2: Criar Manualmente
1. Crie uma imagem quadrada (512x512px recomendado)
2. Use um editor de imagens (GIMP, Photoshop, Canva, etc.)
3. Redimensione para 192x192 e salve como `icon-192.png`
4. Redimensione para 512x512 e salve como `icon-512.png`
5. Coloque os arquivos na raiz do projeto

### Opção 3: Usar Ferramenta de Linha de Comando
Se você tiver ImageMagick instalado:
```bash
# Criar ícone 192x192 (substitua input.png pela sua imagem)
convert input.png -resize 192x192 icon-192.png

# Criar ícone 512x512
convert input.png -resize 512x512 icon-512.png
```

## Sugestão de Design
- Use um ícone relacionado a agricultura/solo (ex: planta, folha, solo)
- Fundo sólido ou transparente
- Cores que combinem com o tema verde (#16a34a)
- Texto legível mesmo em tamanhos pequenos

## Nota
O PWA funcionará mesmo sem os ícones, mas eles melhoram a experiência do usuário ao instalar o aplicativo.


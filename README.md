# CodeShelf V2

- 📎 [Clique aqui para acessar](https://therenanofc.github.io/CodeShelf-V2/) 

- 📎 [Perfil para Demonstração](https://therenanofc.github.io/CodeShelf-V2/profile.html?username=therenanofc)


---

## Descrição

**CodeShelf V2** é uma aplicação web front-end que transforma qualquer perfil público do GitHub em uma estante visual de repositórios, inspirada na interface da Steam Library.  

Totalmente estática, sem backend ou autenticação, o projeto utiliza apenas HTML, CSS e JavaScript puro, com armazenamento local via `localStorage`. Ideal para portfólios, showcases ou visualização rápida de projetos.

---

## Funcionalidades

- **Busca instantânea de usuários GitHub** via API pública  
- **Exibição em cards com capas grandes** (180 px de altura) e overlay gradiente  
- **Edição de capa personalizada** por repositório (upload local → base64 → `localStorage`)  
- **Persistência de capas** entre sessões no mesmo navegador/dispositivo  
- **Badge de linguagem** com cores oficiais do GitHub  
- **Descrição truncada em 2 linhas** (`-webkit-line-clamp` + fallback padrão `line-clamp`)  
- **Estatísticas inline** com ícones SVG: stars, forks, data de atualização  
- **Hover com glow neon**, elevação e escala suave  
- **Design responsivo** (mobile-first, grid flexível)  
- **Fallback de imagem** com placeholder animado  
- **Zero dependências externas**  

---

## Tecnologias

```text
HTML5
CSS3 (Flexbox, Grid, backdrop-filter, webkit-line-clamp)
JavaScript (Vanilla) – fetch, URLSearchParams, FileReader
GitHub REST API v3
localStorage (armazenamento de capas em base64)
Google Fonts: Inter
SVG inline icons
```

## Como Usar

Acesse: https://therenanofc.github.io/CodeShelf-V2/
- Digite um usuário GitHub e clique em Buscar

Licença
MIT License © 2025 therenanofc

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the standard MIT conditions.

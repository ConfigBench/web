import type { ConfigFile } from '../../types/discovery'

export const DEFAULT_FILES: ConfigFile[] = [
  {
    id: 'messages',
    name: 'messages.yml',
    content: `# messages.yml
# Paste your own config over this one.

server:
  motd: "<gradient:#00ffcc:#0055ff>Welcome to the server!</gradient>"
  welcome: "<green>Hey <bold>%player_name%</bold>, welcome back!</green>"

chat:
  prefix: "<dark_red>[</dark_red><gold>Admin</gold><dark_red>]</dark_red> "
  join: "<green>%player_name% joined</green>"
  quit: "<red>%player_name% left</red>"
  balance: "<yellow>Balance:</yellow> <green>%balance%</green>"

top:
  kills: "<gold>#%rank%</gold> <white>%player_name%</white> <gray>-</gray> <green>%kills% kills</green>"
`,
  },
  {
    id: 'menu',
    name: 'menu.yml',
    content: `# menu.yml
# Sample shop menu.

menus:
  shop:
    title: "<gradient:#ffd700:#ff8c00>Server Shop</gradient>"
    items:
      - slot: 4
        name: "<bold>Netherite Heart</bold>"
      - slot: 13
        name: "<bold><gold>Blade of Dawn</gold></bold>"
`,
  },
  {
    id: 'scoreboard',
    name: 'scoreboard.yml',
    content: `# scoreboard.yml
# Sample scoreboard and actionbar.

scoreboard:
  title: "<yellow>TOP PLAYERS</yellow>"
  lines:
    - "<green>%player_name%</green> <gray>-</gray> <white>%kills%</white>"
    - "<gold>%rank%</gold>"
actionbar:
  message: "<#55ff55>Server</#55ff55> quest complete <yellow>+50 XP</yellow>"
`,
  },
]

export interface ElencoFilmeItem {
  id: number
  nome: string
  personagem: string
  fotoPerfil: string | null
}

export interface TrailerFilme {
  id: string
  nome: string
  chave: string
  url: string
}

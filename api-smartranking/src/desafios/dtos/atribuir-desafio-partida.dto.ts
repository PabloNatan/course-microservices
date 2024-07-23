import { IsNotEmpty } from 'class-validator';
import { Jogador } from 'src/jogadores/schemas/jogador.schema';
import { Resultado } from '../schemas/partida.schema';

export class AtribuirDesafioPartidaDto {
  @IsNotEmpty()
  def: Jogador;

  @IsNotEmpty()
  resultado: Resultado[];
}

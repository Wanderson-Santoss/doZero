// src/utils/IconMapping.js

import { 
    Lightning, DropletFill, Hammer, Wrench, 
    HouseDoor, Truck, BrushFill, Display, 
    Tools as GeneralIcon, Lightbulb as EletricaIcon 
} from 'react-bootstrap-icons'; 


// 1. Função de limpeza robusta para padronizar as chaves
export const cleanServiceName = (name) => {
    if (!name) return 'geral';
    // Converte para minúsculas, remove acentos, remove espaços/caracteres especiais
    return name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9]/g, ''); 
}

// 2. Mapeamento dos ícones para o nome limpo do serviço
// A chave DEVE ser o resultado da função cleanServiceName()
export const ICON_MAP = {
    'eletricista': { Icon: EletricaIcon, color: 'text-warning' }, 
    'encanador': { Icon: DropletFill, color: 'text-info' },
    'pintor': { Icon: BrushFill, color: 'text-danger' },
    'limpezadecasa': { Icon: HouseDoor, color: 'text-light' }, 
    'montagemdemoveis': { Icon: Wrench, color: 'text-secondary' }, // Para "Montagem de Móveis"
    'tecnicodeinformatica': { Icon: Display, color: 'text-info' }, // Para "Técnico de Informática"
    
    // Fallback
    'geral': { Icon: GeneralIcon, color: 'text-muted' }, 
};
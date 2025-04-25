import { useRef } from "react";
import { SelectItem } from "@/components/ui/select";
import type { CNAE } from "@/services/CNAEService";
import { useVirtualizer } from "@tanstack/react-virtual";

interface CNAEsListProps {
  cnaes: CNAE[];
  value?: string;
}

const formatCNAECode = (code: string) => {
  // Formata o código CNAE para o padrão XX.XX-X
  if (code.length === 7) {
    return `${code.slice(0, 2)}.${code.slice(2, 4)}-${code.slice(4)}`;
  }
  return code;
};

const ITEM_HEIGHT = 50; // Aumentado para acomodar 2 linhas

const CNAEsList = ({ cnaes, value }: CNAEsListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: cnaes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  // Encontrar o CNAE selecionado
  const selectedCNAE = cnaes.find(cnae => cnae.code === value);

  return (
    <div className="space-y-2">
      {/* Mostrar detalhes do CNAE selecionado */}
      {selectedCNAE && (
        <div className="p-3 bg-muted rounded-md text-sm space-y-1">
          <div className="font-medium text-base">{formatCNAECode(selectedCNAE.code)}</div>
          <div className="text-sm">{selectedCNAE.description}</div>
        </div>
      )}

      {/* Lista virtualizada */}
      <div ref={parentRef} className="h-[300px] overflow-auto rounded-md border">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const cnae = cnaes[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  transform: `translateY(${virtualItem.start}px)`,
                  width: '100%',
                }}
              >
                <SelectItem 
                  value={cnae.code}
                  className="h-[50px] py-2"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="font-medium text-base">
                      {formatCNAECode(cnae.code)}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {cnae.description}
                    </div>
                  </div>
                </SelectItem>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CNAEsList; 
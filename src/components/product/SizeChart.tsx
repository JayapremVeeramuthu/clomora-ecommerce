import React from 'react';
import { X, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sizeChart } from '@/data/constants';

interface SizeChartProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeChart: React.FC<SizeChartProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-card border border-border rounded-xl z-50 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Ruler className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Size Guide</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Size Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-display font-semibold">Size</th>
                  {sizeChart.sizes.map((size) => (
                    <th key={size} className="text-center py-3 px-4 font-display font-semibold">
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(sizeChart.measurements).map(([key, values]) => (
                  <tr key={key} className="border-b border-border/50">
                    <td className="py-3 px-4 capitalize font-medium">{key}</td>
                    {values.map((value, index) => (
                      <td key={index} className="text-center py-3 px-4 text-muted-foreground">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Measurement Guide */}
          <div className="mt-8 space-y-4">
            <h3 className="font-display font-semibold">How to Measure</h3>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-medium">Chest</p>
                  <p className="text-sm text-muted-foreground">
                    Measure around the fullest part of your chest, keeping the tape horizontal.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-medium">Length</p>
                  <p className="text-sm text-muted-foreground">
                    Measure from the highest point of the shoulder down to the hem.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-medium">Shoulder</p>
                  <p className="text-sm text-muted-foreground">
                    Measure from one shoulder point across the back to the other.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-secondary rounded-lg">
            <h3 className="font-display font-semibold mb-2">Fit Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• For a relaxed fit, we recommend sizing up</li>
              <li>• Oversized styles are designed to be loose</li>
              <li>• Slim fits are true to size</li>
              <li>• Still unsure? Our support team is here to help!</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default SizeChart;

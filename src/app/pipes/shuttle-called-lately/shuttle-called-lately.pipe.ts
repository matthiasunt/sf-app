import { Pipe, PipeTransform } from '@angular/core';
import { HistoryElement } from '@models/history-element';

@Pipe({
  name: 'shuttleCalledLately',
})
export class ShuttleCalledLatelyPipe implements PipeTransform {
  transform(shuttleId: string, history: HistoryElement[]): any {
    const calledLast = history.filter((h) => {
      return (new Date().getTime() - new Date(h.date).getTime()) / 36e5 < 0.5;
    });
    return calledLast.findIndex((c) => c.shuttle.id === shuttleId) > -1;
  }
}

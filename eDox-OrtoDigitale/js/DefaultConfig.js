/*
Copyright 2017 Doxee S.p.A.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
var DefaultConfig = function (_jQuery) {
    var $ = _jQuery;
    return {
        /******************
         * Charts
         ******************/
        charts: {
            /**
             * Month names to translate charts
             *
             * @type {string[]}
             */
            monthNames: [
                'Gennaio',
                'Febbraio',
                'Marzo',
                'Aprile',
                'Maggio',
                'Giugno',
                'Luglio',
                'Agosto',
                'Settembre',
                'Ottobre',
                'Novembre',
                'Dicembre'],

            /**
             * Short Month names to translate charts
             *
             * @type {string[]}
             */
            shortMonthNames: [
                'Gen',
                'Feb',
                'Mar',
                'Apr',
                'Mag',
                'Giu',
                'Lug',
                'Ago',
                'Set',
                'Ott',
                'Nov',
                'Dic'],

            /**
             * Size of chart "Drag Icon" (the icons used to resize the chart)
             * @type {number}
             */
            chartDragIconWidth: 25,
            chartDragIconHeight: 25
        },
        /******************
         * Datatables
         ******************/
        dataTables: {
            config: {
                "bSort": false,
                "pageLength": -1,
                "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Tutti"]],
                "language": {
                    "emptyTable": "Tabella vuota",
                    "info": "Pagina _PAGE_ di _PAGES_",
                    "infoEmpty": "Nessun record disponibile",
                    "infoFiltered": "(Filtrato da un totale di _MAX_ record)",
                    "lengthMenu": "_MENU_ record",
                    "search": "Cerca:",
                    "zeroRecords": "Nessun record trovato",
                    "paginate": {
                        "first": "Prima",
                        "last": "Ultima",
                        "next": "Prossima",
                        "previous": "Precedente"
                    },
                    "aria": {
                        "sortAscending": ": attiva per ordinare la colonna in ordine crescente",
                        "sortDescending": ": attiva per ordinare la colonna in ordine decrescente"
                    }
                }
            }
        }
    };

}(jQuery);

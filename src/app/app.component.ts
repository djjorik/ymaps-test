import { Component, ChangeDetectorRef } from '@angular/core';
declare var ymaps: any;
import * as $ from "jquery";
import { environment } from './../environments/environment.prod';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    public map: any;
    public color = '#8080ff';
    public longitude;
    public latitude;
    public baloon;
    public placeMarks = [];
    constructor(private cdRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        let self = this;
        ymaps.ready().then(() => {
            this.map = new ymaps.Map('map', {
                center: [55, 37],
                zoom: 10
            }, {
                    searchControlProvider: 'yandex#search'
                })
        });
    }

    addNewMarker() {
        let self = this;
        let id = this.placeMarks.length;
        // Создание макета содержимого балуна.
        // Макет создается с помощью фабрики макетов с помощью текстового шаблона.
        let BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            `<div style="margin: 10px;">
            ${this.baloon} <br>
            <button id="delete">Удалить</button>
            </div>`, {

                // Переопределяем функцию build, чтобы при создании макета начинать
                // слушать событие click на кнопке-счетчике.
                build: function () {
                    // Сначала вызываем метод build родительского класса.
                    BalloonContentLayout.superclass.build.call(this);
                    // А затем выполняем дополнительные действия.
                    $('#delete').bind('click', this.deleteMarker);
                },

                // Аналогично переопределяем функцию clear, чтобы снять
                // прослушивание клика при удалении макета с карты.
                clear: function () {
                    // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                    // а потом вызываем метод clear родительского класса.
                    $('#delete').unbind('click', this.deleteMarker);
                    BalloonContentLayout.superclass.clear.call(this);
                },
                deleteMarker: function () {
                    self.findMarkerById(id);
                }
            });
        let placemark = new ymaps.Placemark([this.longitude, this.latitude], {
            name: 'marker'
        }, {
                balloonContentLayout: BalloonContentLayout,
                // Запретим замену обычного балуна на балун-панель.
                // Если не указывать эту опцию, на картах маленького размера откроется балун-панель.
                balloonPanelMaxMapArea: 0,
                iconColor: this.color
            });
        this.placeMarks.push({ placemark, id, baloon: this.baloon, lat: this.latitude, lng: this.longitude });

        this.map.geoObjects.add(placemark);

    }

    findMarkerById(id) {
        let index = this.placeMarks.findIndex(item => {
            return item.id == id;
        })
        let marker = this.placeMarks[index];
        this.deleteMarker(marker);
        this.placeMarks.splice(index, 1);
        this.cdRef.detectChanges();
    }

    deleteMarker(m) {
        this.map.geoObjects.remove(m.placemark);
    }

    setCenter(lng, lat) {
        this.map.setCenter([lng, lat])
    }

}


const expect = require('expect');

var { clearDatabase } = require('./../seed/seed');

describe('Loading models', () => {

    describe('Category: Restaurant', () => {
        it('should load model: Organisation', () => {
            var { Organisation } = require('../../models');
            expect(Organisation).toBeTruthy();
        });

        it('should load model: Restaurant', () => {
            var { Restaurant } = require('../../models');
            expect(Restaurant).toBeTruthy();
        });

        it('should load model: Salle', () => {
            var { Salle } = require('../../models');
            expect(Salle).toBeTruthy();
        });

        it('should load model: Table', () => {
            var { Table } = require('../../models');
            expect(Table).toBeTruthy();
        });
    });

    describe('Category: Inventaire', () => {
        it('should load model: Article', () => {
            var { Article } = require('../../models');
            expect(Article).toBeTruthy();
        });

        it('should load model: CommandeArticle', () => {
            var { CommandeArticle } = require('../../models');
            expect(CommandeArticle).toBeTruthy();
        });

        it('should load model: Fournisseur', () => {
            var { Fournisseur } = require('../../models');
            expect(Fournisseur).toBeTruthy();
        });

        it('should load model: Listefournisseur', () => {
            var { ListeFournisseur } = require('../../models');
            expect(ListeFournisseur).toBeTruthy();
        });
    });

    describe('Category: Employe', () => {

        it('should load model: Employe', () => {
            var { Employe } = require('../../models');
            expect(Employe).toBeTruthy();
        });

        it('should load model: Poste', () => {
            var { Poste } = require('../../models');
            expect(Poste).toBeTruthy();
        });

        it('should load model: Token', () => {
            var { Token } = require('../../models');
            expect(Token).toBeTruthy();
        });
    });

    describe('Category: Client', () => {
        it('should load model: Commande', () => {
            var { Commande } = require('../../models');
            expect(Commande).toBeTruthy();
        });

        it('should load model: CommandeItem', () => {
            var { CommandeItem } = require('../../models');
            expect(CommandeItem).toBeTruthy();
        });

        it('should load model: FactureItem', () => {
            var { FactureItem } = require('../../models');
            expect(FactureItem).toBeTruthy();
        });

        it('should load model: Facture', () => {
            var { Facture } = require('../../models');
            expect(Facture).toBeTruthy();
        });

        it('should load model: Reservation', () => {
            var { Reservation } = require('../../models');
            expect(Reservation).toBeTruthy();
        });
    });

    describe('Category: Alimentation', () => {
        it('should load model: Item', () => {
            var { Item } = require('../../models');
            expect(Item).toBeTruthy();
        });

        it('should load model: Menu', () => {
            var { Menu } = require('../../models');
            expect(Menu).toBeTruthy();
        });

        it('should load model: ArticleItem', () => {
            var { ArticleItem } = require('../../models');
            expect(ArticleItem).toBeTruthy();
        });
    });
});
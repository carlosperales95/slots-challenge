export default class Resources {
    balance;
    stake;
    win;

    constructor(balance, stake, win) {
        this.balance = 5;
        this.stake = 1;
        this.win = 0;
    }

    addStake = () => {
        if (this.stake > 0 && this.stake < 3 && this.balance - (this.stake + 1) >= 0) {
            this.stake ++;
        }
    };
    minusStake = () => {
        if (this.stake > 1) {
            this.stake --;
        }
    };
    reduceBalance = () => {
        this.balance -= this.stake;
    }

    addBalance = (prize) => {
        this.balance += this.stake * prize;
        this.win = this.stake * prize;
        console.log("Balance updated, player gets ", this.stake, " * ", prize, " = ", this.stake * prize);
    }
}
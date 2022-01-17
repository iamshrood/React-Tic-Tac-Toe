import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// 棋盘格
function Square(props) {
  return (
    <button className={props.winner.indexOf(props.index) !== -1 ? 'winnerSquare square' : 'square'} onClick={props.onClick}>
      {props.value}
    </button>
  )
}
// 棋盘
class Board extends React.Component {
  renderSquare(i) { // 渲染棋盘格
    let renderBoard = [];
    let width = Math.sqrt(i);
    for(let row = 0; row < width; row++) {
      let boardRow = [];
      for(let cell = 0; cell < width; cell++) {
        boardRow.push(
          <Square
            key={cell}
            index={cell + (row * width)}
            winner={this.props.winner}
            value={this.props.squares[cell + (row * width)]}
            onClick={() => this.props.onClick(cell + (row * width))}
          />
        )
      }
      renderBoard.push(
        <div className="board-row" key={row}>
          {boardRow}
        </div>
      )
    }
    return renderBoard;
  }

  render() {
    return (
      <div>
        {this.renderSquare(9)}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          id: 1,
          coordinate: [null, null],
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      sortType: true
    }
  }
  // 棋盘格点击事件
  handleClick(i) {
    const history = this.state.sortType ? this.state.history.slice(0, this.state.history.findIndex(item => item.id === this.state.stepNumber + 1) + 1) :
    this.state.history.slice(this.state.history.findIndex(item => item.id === this.state.stepNumber + 1),this.state.history.length);
    const current = this.state.sortType ? history[history.length - 1] : history[0]; // 当前记录
    const squares = current.squares.slice(); // 当前记录中的棋盘数组副本
    if(calculateWinner(squares) || squares[i]) { // 如果当前点击方格赢了或当前方格已被占领就return
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O'; // 不满足以上条件则当前玩家占领该方格
    this.setState({ // 修改历史记录、当前步数、下一位玩家
      history: this.state.sortType ? history.concat([{
        id: this.state.stepNumber + 2,
        coordinate: [(i/3).toFixed(0), i%3],
        squares: squares
      }]) :
      [{
        id: this.state.stepNumber + 2,
        coordinate: [(i/3).toFixed(0), i%3],
        squares: squares
      }].concat(history),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  initialize() {
    this.setState({
      stepNumber: 0,
      history: [
        {
          id: 1,
          coordinate: [null, null],
          squares: Array(9).fill(null)
        }
      ]
    })
  }

  jumpTo(step) { // 历史记录跳转事件
    this.setState({ // 重新设定步数以及下棋玩家
      stepNumber:step,
      xIsNext: (step % 2) === 0
    });
  }

  changeSortType() {
    this.setState({
      sortType: !this.state.sortType,
      history: this.state.history.slice().reverse()
    });
  }

  render() {
    const history = this.state.history;
    var current = history.find(item => item.id === this.state.stepNumber + 1);
    let calculateResult = calculateWinner(current.squares);
    const winner = calculateResult ? current.squares[calculateWinner(current.squares)[0]] : null;
    const winnerSquares = calculateWinner(current.squares);
    let moves = history.map((step, move) => {
      return(
        <li key={step.id}>
          <span>{step.id}.</span>
          <button className={this.state.stepNumber === step.id - 1 ? 'clicked' : ''} onClick={() => this.jumpTo(step.id - 1)}>{step.id !== 1 ?
            'Go to move ' + step.coordinate.toLocaleString() :
            'Go to game start'}
          </button>
        </li>
      )
    })

    let status;
    if(winner != null) {
      status = 'Winner: ' + winner;
      setTimeout(() => {
        this.initialize();
      },3000)
    } else if(current.squares.indexOf(null) === -1) { // 如果死局就重开
      status = 'Draw'
      setTimeout(() => {
        this.initialize();
      },3000)
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            winner={winnerSquares || []}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.changeSortType()}>{this.state.sortType ? '升序' : '降序'}</button>
          <ul className='clearUlStyle'>{moves}</ul>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      // return squares[a];
      return [a, b, c]
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
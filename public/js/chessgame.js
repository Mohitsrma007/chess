const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

let renderBoard =  () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row,rowindex) => {
        row.forEach((square,squareindex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowindex + squareindex) %2 === 0 ? "light" : "dark"
            ); 
          
           squareElement.dataset.row = rowindex;
           squareElement.dataset.col = squareindex;

           if(square){
            const pieceElement = document.createElement("div");
            pieceElement.classList.add(
                "piece",
                square.color === "b" ? "black" : "white"
            );
            pieceElement.innerText = getPieceUnicode(square);
            pieceElement.draggable = playerRole === square.color;

            pieceElement.addEventListener("dragstart", (e) => {
                if(pieceElement.draggable){
                    draggedPiece = pieceElement;
                    sourceSquare = { row : rowindex, col: squareindex};
                    e.dataTransfer.setData("text/plain", "");
                }
            });
            
            pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
            });
                squareElement.appendChild(pieceElement);
           }

           squareElement.addEventListener("dragover", function(e){
              e.preventDefault();
           });

           squareElement.addEventListener("drop", function(e){
            e.preventDefault();
           
            if(draggedPiece){
                const targetSource = {
                    row: parseInt(squareElement.dataset.row),
                    col: parseInt(squareElement.dataset.col),
                };
    
                handleMove(sourceSquare, targetSource)
            }
        
         });
         boardElement.appendChild(squareElement);
        });
       
    });

    if(playerRole === "b"){
        boardElement.classList.add("flipped");
    }else{
        boardElement.classList.remove("flipped");
    }
};


const handleMove = (source, target) => {
    
    const promotionSelect = document.getElementById('promotion');
    const promotion = promotionSelect.value;

    const move = {
        from:`${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to:`${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: promotion,
    };
    socket.emit("move", move);
};


const getPieceUnicode = (piece) => {
    const unicodePieces = {
        'K': "\u2654",  // White King ♔
        'Q': "\u2655",  // White Queen ♕
        'R': "\u2656",  // White Rook ♖
        'B': "\u2657",  // White Bishop ♗
        'N': "\u2658",  // White Knight ♘
        'P': "\u2659", // White Pawn ♙
        'k': "\u265A",  // Black King ♚
        'q': "\u265B",  // Black Queen ♛
        'r': "\u265C",  // Black Rook ♜
        'b': "\u265D",  // Black Bishop ♝
        'p': "\u2659",  // Black Pawn ♟
        'n': "\u265E",  // Black Knight ♞
    };

    
    // Return the corresponding unicode character or an empty string if not found
    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function(role) {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function(){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(fen){
    chess.load(fen);
    renderBoard();
});

socket.on("move", function(move){
    chess.move(move);
    renderBoard();
});

renderBoard();

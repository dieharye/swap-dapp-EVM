//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IDEXFactory {
    function createPair(
        address tokenA,
        address tokenB
    ) external returns (address);

    function getPair(
        address tokenA,
        address tokenB
    ) external returns (address);
}

interface IPair {
    // Returns the address of the other token of the pair
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112, uint112, uint32);
}

interface IDEXRouter {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function getAmountsIn(
        uint256 amountOut,
        address[] calldata path
    ) external pure returns (uint256[] memory);

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256);

     function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external pure returns (uint256[] memory);
}

interface IWCRO is IERC20 {
    function deposit () external payable;
    
    function withdraw (
        uint256 wad
    ) external;
}

struct Volume {
    address user;
    uint256 volume;
}

contract SwapPro is Ownable {
    address public constant CUSDC = 0xc21223249CA28397B4B6541dfFaEcC539BfF0c59;
    address public constant CUSDT = 0x66e428c3f67a68878562e79A0234c1F83c208770;
    address public constant WCRO = 0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23;
    address public constant ARY = 0x41bc026dABe978bc2FAfeA1850456511ca4B01bc;
    address public constant DEXROUTER = 0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae;
    address public constant DEXFACTORY = 0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15;
    address public feeReceiver;
    uint256 public feePercent;
    bool public competition_started = false;
    mapping(address => uint) public userVolume;
    mapping(address => bool) isExistAddress;
    address[] public addresses;

    IDEXFactory factory;
    IDEXRouter router;
    IERC20 cusdc;
    IERC20 cusdt;
    IERC20 ary;
    IWCRO wcro;

    constructor() Ownable(msg.sender) {
        factory = IDEXFactory(DEXFACTORY);
        router = IDEXRouter(DEXROUTER);
        cusdc = IERC20(CUSDC);
        cusdt = IERC20(CUSDT);
        ary = IERC20(ARY);
        wcro = IWCRO(WCRO);
        feeReceiver = msg.sender;
        feePercent = 3;

        //Approving tokens
        cusdc.approve(DEXROUTER, type(uint256).max);
        cusdt.approve(DEXROUTER, type(uint256).max);
        ary.approve(DEXROUTER, type(uint256).max);
        wcro.approve(DEXROUTER, type(uint256).max);
    }

    // Function to get sorted addresses
    function getUserVolumes() external view returns (Volume[] memory) {
        uint256 n = addresses.length;
        Volume[] memory volumes = new Volume[](n); // Initialize memory array with fixed size

        for (uint256 i = 0; i < n; i++) {
            volumes[i] = Volume(addresses[i], userVolume[addresses[i]]);
        }

        return volumes;
    }

    // Function to clear volume record
    function clearVolume() public onlyOwner{
        uint256 n = addresses.length;
        for(uint256 i = 0; i < n; i++) {
            delete userVolume[addresses[i]];
        }
        delete addresses;
        competition_started = false;
    }

    function stopCompetition() public onlyOwner {
        competition_started = false;
    }
    function startCompetition() public onlyOwner {
        competition_started = true;
    }

    // Function to config the fee rate and fee receiver
    function setFeeData(address _feeReceiver, uint256 _feePercent) public onlyOwner {
        feeReceiver = _feeReceiver;
        feePercent = _feePercent;
    }

    // Function to get fee from trading
    function getFee(address fromToken, uint256 feeAmount) private {
        uint256 pathLen = fromToken == WCRO ? 1 : 2;
        if(pathLen == 1){
            wcro.transfer(feeReceiver, feeAmount);
        } else {
            address[] memory path = new address[](pathLen);
            path[0] = fromToken;
            path[1] = WCRO;

            router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                feeAmount,
                0,
                path,
                feeReceiver,
                block.timestamp + 1 hours
            );
        }
    }

    function addVolume (
        address user,
        uint256 volume
    ) private {
        if(!isExistAddress[user]) {
            addresses.push(user);
            isExistAddress[user] = true;
        } 
        
        userVolume[user] += volume;
    }

    //Function to swap token for token
    function swapTokenForToken(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 amountOutMin
    ) public {
        IERC20(fromToken).transferFrom(msg.sender, address(this), amountIn);

        if(fromToken == ARY && competition_started) {
            addVolume(msg.sender, amountIn);
        }

        uint256 feeAmount = amountIn * feePercent / 1000;
        getFee(fromToken, feeAmount);

        uint256 pathLen;
        pathLen = (fromToken == WCRO || toToken == WCRO) ? 2 : 3;

        uint256 amountOut;
        address[] memory path;
        if (fromToken == WCRO || toToken == WCRO) {
            path = new address[](2) ;
            path[0] = fromToken;
            path[1] = toToken;
            uint256[] memory amountsOut = router.getAmountsOut(amountIn - feeAmount, path);
            amountOut = amountsOut[1];
        } else {
            path = new address[](3) ;
            path[0] = fromToken;
            path[1] = WCRO;
            path[2] = toToken;
            uint256[] memory amountsOut = router.getAmountsOut(amountIn - feeAmount, path);
            amountOut = amountsOut[2];
        }
        
        router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amountIn - feeAmount,
            amountOutMin,
            path,
            msg.sender,
            block.timestamp + 1 hours
        );
        
        if(toToken == ARY && competition_started) {
            addVolume(msg.sender, amountOut);
        }
    }

    // Function to swap coin for token
    function swapCROForToken (
        address toToken,
        uint256 amountOutMin
    ) public payable {
        uint256 amountIn = msg.value;
        uint256 feeAmount = amountIn * feePercent / 1000;
        payable(feeReceiver).transfer(feeAmount);

        address[] memory path = new address[](2);
        path[0] = WCRO;
        path[1] = toToken;

        uint256[] memory amountsOut = router.getAmountsOut(amountIn - feeAmount, path);
        router.swapExactETHForTokensSupportingFeeOnTransferTokens{ value:amountIn - feeAmount}(
            amountOutMin,
            path,
            msg.sender,
            block.timestamp + 1 hours
        );

        if(toToken == ARY && competition_started) {
            addVolume(msg.sender, amountsOut[1]);
        }
    }  


    // Function to swap token for coin
    function swapTokenForCRO(
        address fromToken,
        uint256 amountIn,
        uint256 amountOutMin
    ) public {

        if(fromToken == ARY && competition_started) addVolume(msg.sender, amountIn);
        IERC20(fromToken).transferFrom(msg.sender, address(this), amountIn);
        
        uint256 feeAmount = amountIn * feePercent / 1000;

        getFee(fromToken, feeAmount);

        address[] memory path = new address[](2);
        path[0] = fromToken;
        path[1] = WCRO;
        router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn - feeAmount,
            amountOutMin,
            path,
            msg.sender,
            block.timestamp + 1 hours
        );
    }

    //Function to wrap Cro
    function deposit () public payable {
        uint256 amountIn = msg.value;
        wcro.deposit{value:amountIn}();
        wcro.transfer( msg.sender, amountIn );
    }

    function withdraw (
        uint256 wad
    ) public {
        wcro.transferFrom(msg.sender, address(this), wad);
        wcro.withdraw(wad);       
        payable(msg.sender).transfer(wad);
    }

    // Function to transfer contract ownership
    function transferContractOwnership(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }

    receive() external payable {}
}//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IDEXFactory {
    function createPair(
        address tokenA,
        address tokenB
    ) external returns (address);

    function getPair(
        address tokenA,
        address tokenB
    ) external returns (address);
}

interface IPair {
    // Returns the address of the other token of the pair
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112, uint112, uint32);
}

interface IDEXRouter {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function getAmountsIn(
        uint256 amountOut,
        address[] calldata path
    ) external pure returns (uint256[] memory);

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256);

     function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external pure returns (uint256[] memory);
}

interface IWCRO is IERC20 {
    function deposit () external payable;
    
    function withdraw (
        uint256 wad
    ) external;
}

struct Volume {
    address user;
    uint256 volume;
}

contract SwapPro is Ownable {
    address public constant CUSDC = 0xc21223249CA28397B4B6541dfFaEcC539BfF0c59;
    address public constant CUSDT = 0x66e428c3f67a68878562e79A0234c1F83c208770;
    address public constant WCRO = 0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23;
    address public constant ARY = 0x41bc026dABe978bc2FAfeA1850456511ca4B01bc;
    address public constant DEXROUTER = 0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae;
    address public constant DEXFACTORY = 0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15;
    address public feeReceiver;
    uint256 public feePercent;
    bool public competition_started = false;
    mapping(address => uint) public userVolume;
    mapping(address => bool) isExistAddress;
    address[] public addresses;

    IDEXFactory factory;
    IDEXRouter router;
    IERC20 cusdc;
    IERC20 cusdt;
    IERC20 ary;
    IWCRO wcro;

    constructor() Ownable(msg.sender) {
        factory = IDEXFactory(DEXFACTORY);
        router = IDEXRouter(DEXROUTER);
        cusdc = IERC20(CUSDC);
        cusdt = IERC20(CUSDT);
        ary = IERC20(ARY);
        wcro = IWCRO(WCRO);
        feeReceiver = msg.sender;
        feePercent = 3;

        //Approving tokens
        cusdc.approve(DEXROUTER, type(uint256).max);
        cusdt.approve(DEXROUTER, type(uint256).max);
        ary.approve(DEXROUTER, type(uint256).max);
        wcro.approve(DEXROUTER, type(uint256).max);
    }

    // Function to get sorted addresses
    function getUserVolumes() external view returns (Volume[] memory) {
        uint256 n = addresses.length;
        Volume[] memory volumes = new Volume[](n); // Initialize memory array with fixed size

        for (uint256 i = 0; i < n; i++) {
            volumes[i] = Volume(addresses[i], userVolume[addresses[i]]);
        }

        return volumes;
    }

    // Function to clear volume record
    function clearVolume() public onlyOwner{
        uint256 n = addresses.length;
        for(uint256 i = 0; i < n; i++) {
            delete userVolume[addresses[i]];
        }
        delete addresses;
        competition_started = false;
    }

    function stopCompetition() public onlyOwner {
        competition_started = false;
    }
    function startCompetition() public onlyOwner {
        competition_started = true;
    }

    // Function to config the fee rate and fee receiver
    function setFeeData(address _feeReceiver, uint256 _feePercent) public onlyOwner {
        feeReceiver = _feeReceiver;
        feePercent = _feePercent;
    }

    // Function to get fee from trading
    function getFee(address fromToken, uint256 feeAmount) private {
        uint256 pathLen = fromToken == WCRO ? 1 : 2;
        if(pathLen == 1){
            wcro.transfer(feeReceiver, feeAmount);
        } else {
            address[] memory path = new address[](pathLen);
            path[0] = fromToken;
            path[1] = WCRO;

            router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                feeAmount,
                0,
                path,
                feeReceiver,
                block.timestamp + 1 hours
            );
        }
    }

    function addVolume (
        address user,
        uint256 volume
    ) private {
        if(!isExistAddress[user]) {
            addresses.push(user);
            isExistAddress[user] = true;
        } 
        
        userVolume[user] += volume;
    }

    //Function to swap token for token
    function swapTokenForToken(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 amountOutMin
    ) public {
        IERC20(fromToken).transferFrom(msg.sender, address(this), amountIn);

        if(fromToken == ARY && competition_started) {
            addVolume(msg.sender, amountIn);
        }

        uint256 feeAmount = amountIn * feePercent / 1000;
        getFee(fromToken, feeAmount);

        uint256 pathLen;
        pathLen = (fromToken == WCRO || toToken == WCRO) ? 2 : 3;

        uint256 amountOut;
        address[] memory path;
        if (fromToken == WCRO || toToken == WCRO) {
            path = new address[](2) ;
            path[0] = fromToken;
            path[1] = toToken;
            uint256[] memory amountsOut = router.getAmountsOut(amountIn - feeAmount, path);
            amountOut = amountsOut[1];
        } else {
            path = new address[](3) ;
            path[0] = fromToken;
            path[1] = WCRO;
            path[2] = toToken;
            uint256[] memory amountsOut = router.getAmountsOut(amountIn - feeAmount, path);
            amountOut = amountsOut[2];
        }
        
        router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amountIn - feeAmount,
            amountOutMin,
            path,
            msg.sender,
            block.timestamp + 1 hours
        );
        
        if(toToken == ARY && competition_started) {
            addVolume(msg.sender, amountOut);
        }
    }

    // Function to swap coin for token
    function swapCROForToken (
        address toToken,
        uint256 amountOutMin
    ) public payable {
        uint256 amountIn = msg.value;
        uint256 feeAmount = amountIn * feePercent / 1000;
        payable(feeReceiver).transfer(feeAmount);

        address[] memory path = new address[](2);
        path[0] = WCRO;
        path[1] = toToken;

        uint256[] memory amountsOut = router.getAmountsOut(amountIn - feeAmount, path);
        router.swapExactETHForTokensSupportingFeeOnTransferTokens{ value:amountIn - feeAmount}(
            amountOutMin,
            path,
            msg.sender,
            block.timestamp + 1 hours
        );

        if(toToken == ARY && competition_started) {
            addVolume(msg.sender, amountsOut[1]);
        }
    }  


    // Function to swap token for coin
    function swapTokenForCRO(
        address fromToken,
        uint256 amountIn,
        uint256 amountOutMin
    ) public {

        if(fromToken == ARY && competition_started) addVolume(msg.sender, amountIn);
        IERC20(fromToken).transferFrom(msg.sender, address(this), amountIn);
        
        uint256 feeAmount = amountIn * feePercent / 1000;

        getFee(fromToken, feeAmount);

        address[] memory path = new address[](2);
        path[0] = fromToken;
        path[1] = WCRO;
        router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn - feeAmount,
            amountOutMin,
            path,
            msg.sender,
            block.timestamp + 1 hours
        );
    }

    //Function to wrap Cro
    function deposit () public payable {
        uint256 amountIn = msg.value;
        wcro.deposit{value:amountIn}();
        wcro.transfer( msg.sender, amountIn );
    }

    function withdraw (
        uint256 wad
    ) public {
        wcro.transferFrom(msg.sender, address(this), wad);
        wcro.withdraw(wad);       
        payable(msg.sender).transfer(wad);
    }

    // Function to transfer contract ownership
    function transferContractOwnership(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }

    receive() external payable {}
}
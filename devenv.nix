{
  pkgs,
  ...
}:

{
  packages = [
    pkgs.foundry
    pkgs.deno
  ];
  languages = {
    solidity.enable = true;
    deno.enable = true;
  };

  env = {
    OWNER_PRIVKEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  };

  tasks = {
    "forge:deploy" = {
      exec = ''
        ${pkgs.foundry}/bin/forge script script/Voting.s.sol \
        --broadcast \
        --rpc-url http://localhost:8545 \
        --private-key $OWNER_PRIVKEY'';
      before = [ "devenv:processes:backend" ];
    };

    "forge:build" = {
      exec = ''
        ${pkgs.foundry}/bin/forge build
      '';
    };

  };

  processes = {
    anvil = {
      exec = "${pkgs.foundry}/bin/anvil";
      process-compose.readiness_probe = {
        exec.command = ''
          curl -X POST http://127.0.0.1:8545 \
          -H "Content-Type: application/json" \
          -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
        '';
        initial_delay_seconds = 2;
      };
    };

    backend = {
      exec = ''
        pushd backend
        deno run dev
      '';
      process-compose.depends_on = {
        "anvil".condition = "process_healthy";
      };
    };
  };
}

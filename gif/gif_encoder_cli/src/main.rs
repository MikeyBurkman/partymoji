use std::env;

use anyhow::{anyhow, Context, Result};

fn main() -> Result<()> {
    let args = env::args().collect::<Vec<_>>();
    if args.len() < 3 {
        return Err(anyhow!("Usage: blah <lhs> <rhs>")).context("incorrect number of args");
    }

    let _lhs = args[1].parse::<i32>()?;
    let _rhs = args[2].parse::<i32>()?;

    Ok(())
}